package org.aarogyalink.data.remote

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface AarogyaApiService {

    @GET("health")
    suspend fun checkHealth(): Response<HealthResponseDto>

    @POST("reports")
    suspend fun submitReport(@Body report: ReportCreateDto): Response<ReportResponseDto>

    @GET("reports/{report_id}")
    suspend fun getReportById(@Path("report_id") reportId: String): Response<ReportResponseDto>

    @POST("sync/push")
    suspend fun syncPush(@Body request: SyncPushRequestDto): Response<SyncPushResponseDto>

    @GET("sync/pull")
    suspend fun syncPull(
        @Query("report_ids") reportIds: String? = null,
        @Query("since") since: String? = null
    ): Response<SyncPullResponseDto>

    @GET("facilities")
    suspend fun getFacilities(
        @Query("district") district: String? = null,
        @Query("operational_only") operationalOnly: Boolean = true
    ): Response<List<FacilityDto>>
}
