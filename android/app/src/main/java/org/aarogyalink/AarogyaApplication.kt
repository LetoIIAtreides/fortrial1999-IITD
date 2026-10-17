package org.aarogyalink

import android.app.Application
import org.aarogyalink.data.local.AarogyaDatabaseHelper
import org.aarogyalink.data.remote.RetrofitClient
import org.aarogyalink.data.repository.EmergencyReportRepository
import org.aarogyalink.data.repository.EmergencyReportRepositoryImpl
import org.aarogyalink.data.sync.NetworkMonitor
import org.aarogyalink.data.sync.SyncScheduler

class AarogyaApplication : Application() {

    lateinit var databaseHelper: AarogyaDatabaseHelper
        private set

    lateinit var repository: EmergencyReportRepository
        private set

    lateinit var networkMonitor: NetworkMonitor
        private set

    override fun onCreate() {
        super.onCreate()

        databaseHelper = AarogyaDatabaseHelper.getInstance(this)
        val apiService = RetrofitClient.getApiService()
        repository = EmergencyReportRepositoryImpl(databaseHelper, apiService)
        networkMonitor = NetworkMonitor(this)

        // Schedule background sync worker via WorkManager
        SyncScheduler.schedulePeriodicSync(this)
    }
}
