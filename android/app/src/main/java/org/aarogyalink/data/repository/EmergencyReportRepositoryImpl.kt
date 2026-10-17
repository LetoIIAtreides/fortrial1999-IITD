package org.aarogyalink.data.repository

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import org.aarogyalink.data.local.AarogyaDatabaseHelper
import org.aarogyalink.data.local.ReportEntity
import org.aarogyalink.data.local.SyncStatus
import org.aarogyalink.data.local.VerificationStatus
import org.aarogyalink.data.remote.AarogyaApiService
import org.aarogyalink.data.remote.FacilityDto
import org.aarogyalink.data.remote.ReportCreateDto
import org.aarogyalink.data.remote.SyncPushRequestDto
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class EmergencyReportRepositoryImpl(
    private val dbHelper: AarogyaDatabaseHelper,
    private val apiService: AarogyaApiService
) : EmergencyReportRepository {

    private val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }

    override fun getAllReports(): Flow<List<ReportEntity>> {
        return dbHelper.reportsFlow
    }

    override suspend fun getReportById(reportId: String): ReportEntity? {
        return dbHelper.getReportById(reportId)
    }

    override suspend fun saveReportLocally(report: ReportEntity): ReportEntity = withContext(Dispatchers.IO) {
        dbHelper.insertOrUpdate(report)
        report
    }

    override suspend fun submitReportOnline(report: ReportEntity): Result<ReportEntity> = withContext(Dispatchers.IO) {
        // 1. Ensure report is saved locally first
        val pendingReport = report.copy(syncStatus = SyncStatus.SYNCING)
        dbHelper.insertOrUpdate(pendingReport)

        try {
            val dto = ReportCreateDto(
                reportId = pendingReport.reportId,
                emergencyType = pendingReport.emergencyType,
                urgency = pendingReport.urgency,
                latitude = pendingReport.latitude,
                longitude = pendingReport.longitude,
                locationName = pendingReport.locationName,
                description = pendingReport.description,
                createdAt = isoFormat.format(Date(pendingReport.createdAt))
            )

            val response = apiService.submitReport(dto)
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                val serverSyncStatus = try {
                    SyncStatus.valueOf(body.syncStatus)
                } catch (_: Exception) {
                    SyncStatus.RECEIVED_BY_SERVER
                }
                val serverVerStatus = try {
                    VerificationStatus.valueOf(body.verificationStatus)
                } catch (_: Exception) {
                    VerificationStatus.UNVERIFIED
                }

                val syncedReport = pendingReport.copy(
                    syncStatus = serverSyncStatus,
                    verificationStatus = serverVerStatus,
                    lastSyncedAt = System.currentTimeMillis()
                )
                dbHelper.insertOrUpdate(syncedReport)
                Result.success(syncedReport)
            } else {
                val failedReport = pendingReport.copy(syncStatus = SyncStatus.SYNC_FAILED)
                dbHelper.insertOrUpdate(failedReport)
                Result.failure(IOException("Server error: HTTP ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            val failedReport = pendingReport.copy(syncStatus = SyncStatus.SYNC_FAILED)
            dbHelper.insertOrUpdate(failedReport)
            Result.failure(e)
        }
    }

    override suspend fun syncPendingReports(): Result<Int> = withContext(Dispatchers.IO) {
        val pendingList = dbHelper.getPendingReports()
        if (pendingList.isEmpty()) {
            return@withContext Result.success(0)
        }

        try {
            val dtoList = pendingList.map { item ->
                ReportCreateDto(
                    reportId = item.reportId,
                    emergencyType = item.emergencyType,
                    urgency = item.urgency,
                    latitude = item.latitude,
                    longitude = item.longitude,
                    locationName = item.locationName,
                    description = item.description,
                    createdAt = isoFormat.format(Date(item.createdAt))
                )
            }

            val response = apiService.syncPush(SyncPushRequestDto(dtoList))
            if (response.isSuccessful && response.body() != null) {
                val results = response.body()!!.results
                var syncedCount = 0

                for (res in results) {
                    val local = pendingList.find { it.reportId == res.reportId }
                    if (local != null) {
                        val updated = local.copy(
                            syncStatus = SyncStatus.RECEIVED_BY_SERVER,
                            verificationStatus = try {
                                VerificationStatus.valueOf(res.verificationStatus)
                            } catch (_: Exception) {
                                local.verificationStatus
                            },
                            lastSyncedAt = System.currentTimeMillis()
                        )
                        dbHelper.insertOrUpdate(updated)
                        syncedCount++
                    }
                }
                Result.success(syncedCount)
            } else {
                Result.failure(IOException("Sync push failed: HTTP ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun pullVerificationStatuses(): Result<Unit> = withContext(Dispatchers.IO) {
        val reports = dbHelper.getPendingReports() + dbHelper.reportsFlow.let { 
            // Query all local reports
            val all = mutableListOf<ReportEntity>()
            val db = dbHelper.readableDatabase
            val cursor = db.query(AarogyaDatabaseHelper.TABLE_REPORTS, null, null, null, null, null, null)
            cursor.use {
                while (it.moveToNext()) {
                    val id = it.getString(it.getColumnIndexOrThrow(AarogyaDatabaseHelper.COL_REPORT_ID))
                    val type = it.getString(it.getColumnIndexOrThrow(AarogyaDatabaseHelper.COL_EMERGENCY_TYPE))
                    val urgency = it.getString(it.getColumnIndexOrThrow(AarogyaDatabaseHelper.COL_URGENCY))
                    val created = it.getLong(it.getColumnIndexOrThrow(AarogyaDatabaseHelper.COL_CREATED_AT))
                    all.add(ReportEntity(reportId = id, emergencyType = type, urgency = urgency, createdAt = created))
                }
            }
            all
        }

        if (reports.isEmpty()) return@withContext Result.success(Unit)

        val idList = reports.map { it.reportId }.joinToString(",")
        try {
            val res = apiService.syncPull(reportIds = idList)
            if (res.isSuccessful && res.body() != null) {
                for (item in res.body()!!.reports) {
                    val local = dbHelper.getReportById(item.reportId)
                    if (local != null) {
                        val newVerStatus = try {
                            VerificationStatus.valueOf(item.verificationStatus)
                        } catch (_: Exception) {
                            local.verificationStatus
                        }
                        val updated = local.copy(
                            verificationStatus = newVerStatus,
                            verifiedBy = item.verifiedBy,
                            verificationNotes = item.verificationNotes,
                            lastSyncedAt = System.currentTimeMillis()
                        )
                        dbHelper.insertOrUpdate(updated)
                    }
                }
                Result.success(Unit)
            } else {
                Result.failure(IOException("Failed to pull status updates: HTTP ${res.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getFacilities(): Result<List<FacilityDto>> = withContext(Dispatchers.IO) {
        try {
            val res = apiService.getFacilities()
            if (res.isSuccessful && res.body() != null) {
                Result.success(res.body()!!)
            } else {
                Result.failure(IOException("Facilities request failed with HTTP ${res.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun checkServerHealth(): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val res = apiService.checkHealth()
            Result.success(res.isSuccessful && res.body()?.status == "healthy")
        } catch (_: Exception) {
            Result.success(false)
        }
    }
}
