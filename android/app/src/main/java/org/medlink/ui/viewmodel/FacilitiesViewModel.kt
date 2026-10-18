package org.medlink.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.medlink.MedLinkApplication
import org.medlink.data.remote.FacilityDto

class FacilitiesViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = (application as MedLinkApplication).repository

    private val _facilities = MutableStateFlow<List<FacilityDto>>(emptyList())
    val facilities = _facilities.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage = _errorMessage.asStateFlow()

    init {
        loadFacilities()
    }

    fun loadFacilities() {
        _isLoading.value = true
        _errorMessage.value = null
        viewModelScope.launch {
            val result = repository.getFacilities()
            _isLoading.value = false
            if (result.isSuccess) {
                _facilities.value = result.getOrNull() ?: emptyList()
            } else {
                _errorMessage.value = "Unable to fetch live facilities. Check backend connection."
            }
        }
    }
}
