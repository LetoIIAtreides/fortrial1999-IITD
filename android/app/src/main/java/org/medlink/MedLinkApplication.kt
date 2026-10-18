package org.medlink

import android.app.Application
import org.medlink.data.local.MedLinkDatabaseHelper
import org.medlink.data.remote.RetrofitClient
import org.medlink.data.repository.EmergencyReportRepository
import org.medlink.data.repository.EmergencyReportRepositoryImpl
import org.medlink.data.sync.NetworkMonitor
import org.medlink.data.sync.SyncScheduler

class MedLinkApplication : Application() {

    lateinit var databaseHelper: MedLinkDatabaseHelper
        private set

    lateinit var repository: EmergencyReportRepository
        private set

    lateinit var networkMonitor: NetworkMonitor
        private set

    override fun onCreate() {
        super.onCreate()

        databaseHelper = MedLinkDatabaseHelper.getInstance(this)
        val apiService = RetrofitClient.getApiService()
        repository = EmergencyReportRepositoryImpl(databaseHelper, apiService)
        networkMonitor = NetworkMonitor(this)

        // Schedule background sync worker via WorkManager
        SyncScheduler.schedulePeriodicSync(this)
    }
}
