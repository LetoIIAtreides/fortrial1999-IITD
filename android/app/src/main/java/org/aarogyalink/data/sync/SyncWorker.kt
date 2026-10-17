package org.aarogyalink.data.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import org.aarogyalink.AarogyaApplication

class SyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val app = applicationContext as? AarogyaApplication ?: return Result.failure()
        val repository = app.repository

        return try {
            // 1. Sync pending local reports
            val pushResult = repository.syncPendingReports()
            
            // 2. Pull server verification updates
            repository.pullVerificationStatuses()

            if (pushResult.isSuccess) {
                Result.success()
            } else {
                Result.retry()
            }
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
