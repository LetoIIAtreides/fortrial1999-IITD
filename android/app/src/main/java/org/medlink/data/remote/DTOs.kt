package org.medlink.data.remote

import com.google.gson.annotations.SerializedName

data class HealthResponseDto(
    val status: String,
    val service: String,
    val database: String,
    @SerializedName("database_engine") val databaseEngine: String,
    val timestamp: String
)

data class ReportCreateDto(
    @SerializedName("report_id") val reportId: String,
    @SerializedName("emergency_type") val emergencyType: String,
    val urgency: String,
    val latitude: Double? = null,
    val longitude: Double? = null,
    @SerializedName("location_name") val locationName: String? = null,
    val description: String? = null,
    @SerializedName("created_at") val createdAt: String? = null
)

data class ReportResponseDto(
    @SerializedName("report_id") val reportId: String,
    @SerializedName("emergency_type") val emergencyType: String,
    val urgency: String,
    @SerializedName("created_at") val createdAt: String,
    val latitude: Double? = null,
    val longitude: Double? = null,
    @SerializedName("location_name") val locationName: String? = null,
    val description: String? = null,
    @SerializedName("sync_status") val syncStatus: String,
    @SerializedName("verification_status") val verificationStatus: String,
    @SerializedName("verified_at") val verifiedAt: String? = null,
    @SerializedName("verified_by") val verifiedBy: String? = null,
    @SerializedName("verification_notes") val verificationNotes: String? = null,
    @SerializedName("last_synced_at") val lastSyncedAt: String
)

data class FacilityDto(
    @SerializedName("facility_id") val facilityId: String,
    val name: String,
    @SerializedName("facility_type") val facilityType: String,
    val address: String,
    val district: String,
    val state: String,
    val latitude: Double,
    val longitude: Double,
    val phone: String,
    @SerializedName("emergency_capacity") val emergencyCapacity: String,
    @SerializedName("is_operational") val isOperational: Boolean,
    @SerializedName("last_updated_at") val lastUpdatedAt: String
)

data class SyncPushRequestDto(
    val reports: List<ReportCreateDto>
)

data class SyncPushItemResultDto(
    @SerializedName("report_id") val reportId: String,
    val status: String,
    @SerializedName("sync_status") val syncStatus: String,
    @SerializedName("verification_status") val verificationStatus: String
)

data class SyncPushResponseDto(
    val processed: Int,
    val results: List<SyncPushItemResultDto>
)

data class SyncPullResponseDto(
    val reports: List<ReportResponseDto>,
    @SerializedName("server_time") val serverTime: String
)
