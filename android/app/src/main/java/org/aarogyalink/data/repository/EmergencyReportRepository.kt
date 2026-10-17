package org.aarogyalink.data.repository

import kotlinx.coroutines.flow.Flow
import org.aarogyalink.data.local.ReportEntity
import org.aarogyalink.data.remote.FacilityDto

interface EmergencyReportRepository {
    fun getAllReports(): Flow<List<ReportEntity>>
    suspend fun getReportById(reportId: String): ReportEntity?
    suspend fun saveReportLocally(report: ReportEntity): ReportEntity
    suspend fun submitReportOnline(report: ReportEntity): Result<ReportEntity>
    suspend fun syncPendingReports(): Result<Int>
    suspend fun pullVerificationStatuses(): Result<Unit>
    suspend fun getFacilities(): Result<List<FacilityDto>>
    suspend fun checkServerHealth(): Result<Boolean>
}
