package org.aarogyalink.ui.viewmodel

import android.app.Application
import android.speech.tts.TextToSpeech
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.aarogyalink.AarogyaApplication
import org.aarogyalink.data.local.ReportEntity
import org.aarogyalink.data.local.SyncStatus
import org.aarogyalink.data.sync.SyncScheduler
import java.util.Locale

class ReportViewModel(application: Application) : AndroidViewModel(application), TextToSpeech.OnInitListener {

    private val repository = (application as AarogyaApplication).repository
    private val networkMonitor = (application as AarogyaApplication).networkMonitor

    val allReports: StateFlow<List<ReportEntity>> = repository.getAllReports()
        .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    val isOnline: StateFlow<Boolean> = networkMonitor.isOnline
        .stateIn(viewModelScope, SharingStarted.Lazily, true)

    // Form fields
    val selectedCategory = MutableStateFlow("")
    val selectedUrgency = MutableStateFlow("High")
    val latitude = MutableStateFlow<Double?>(null)
    val longitude = MutableStateFlow<Double?>(null)
    val locationName = MutableStateFlow("")
    val description = MutableStateFlow("")

    val isSubmitting = MutableStateFlow(false)
    val submissionMessage = MutableStateFlow<String?>(null)
    val isError = MutableStateFlow(false)

    // Language state ("en" or "hi")
    val currentLanguage = MutableStateFlow("en")

    // TextToSpeech engine
    private var tts: TextToSpeech? = null
    private var isTtsReady = false

    init {
        tts = TextToSpeech(application, this)
        checkBackendHealth()
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(Locale.ENGLISH)
            isTtsReady = result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED
        }
    }

    fun speak(text: String) {
        if (isTtsReady && text.isNotBlank()) {
            if (currentLanguage.value == "hi") {
                tts?.setLanguage(Locale("hi", "IN"))
            } else {
                tts?.setLanguage(Locale.ENGLISH)
            }
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "AarogyaTTS")
        }
    }

    fun checkBackendHealth() {
        viewModelScope.launch {
            repository.checkServerHealth()
        }
    }

    fun setLanguage(lang: String) {
        currentLanguage.value = lang
    }

    fun setLocation(lat: Double, lng: Double, locName: String) {
        latitude.value = lat
        longitude.value = lng
        locationName.value = locName
    }

    fun submitReport(onComplete: (Boolean) -> Unit) {
        if (selectedCategory.value.isBlank()) {
            submissionMessage.value = "Please select an emergency category."
            isError.value = true
            return
        }

        isSubmitting.value = true
        submissionMessage.value = null
        isError.value = false

        viewModelScope.launch {
            val entity = ReportEntity(
                emergencyType = selectedCategory.value,
                urgency = selectedUrgency.value,
                latitude = latitude.value,
                longitude = longitude.value,
                locationName = locationName.value.ifBlank { null },
                description = description.value.ifBlank { null },
                syncStatus = SyncStatus.LOCAL_PENDING
            )

            // Step 1: Always save locally first for reliability
            repository.saveReportLocally(entity)

            // Step 2: Attempt online submission
            val result = repository.submitReportOnline(entity)

            isSubmitting.value = false
            if (result.isSuccess) {
                submissionMessage.value = "Report confirmed and received by emergency response server."
                isError.value = false
                resetForm()
                onComplete(true)
            } else {
                // Preserved locally as SYNC_FAILED, trigger background WorkManager sync
                SyncScheduler.triggerOneTimeSync(getApplication())
                submissionMessage.value = "Saved safely on device. Network unavailable — will automatically sync when connected."
                isError.value = true
                resetForm()
                onComplete(false)
            }
        }
    }

    fun retrySync(report: ReportEntity) {
        viewModelScope.launch {
            val result = repository.submitReportOnline(report)
            if (!result.isSuccess) {
                SyncScheduler.triggerOneTimeSync(getApplication())
            }
        }
    }

    fun pullStatusUpdates() {
        viewModelScope.launch {
            repository.pullVerificationStatuses()
        }
    }

    fun resetForm() {
        selectedCategory.value = ""
        selectedUrgency.value = "High"
        latitude.value = null
        longitude.value = null
        locationName.value = ""
        description.value = ""
    }

    override fun onCleared() {
        super.onCleared()
        tts?.stop()
        tts?.shutdown()
    }
}
