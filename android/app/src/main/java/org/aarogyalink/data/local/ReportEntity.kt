package org.aarogyalink.data.local

import java.util.UUID

enum class SyncStatus {
    LOCAL_PENDING,
    SYNCING,
    RECEIVED_BY_SERVER,
    SYNC_FAILED
}

enum class VerificationStatus {
    UNVERIFIED,
    VERIFIED,
    REJECTED,
    RESOLVED
}

data class ReportEntity(
    val reportId: String = UUID.randomUUID().toString(),
    val emergencyType: String,
    val urgency: String,
    val createdAt: Long = System.currentTimeMillis(),
    val latitude: Double? = null,
    val longitude: Double? = null,
    val locationName: String? = null,
    val description: String? = null,
    val syncStatus: SyncStatus = SyncStatus.LOCAL_PENDING,
    val verificationStatus: VerificationStatus = VerificationStatus.UNVERIFIED,
    val lastSyncedAt: Long? = null,
    val verifiedBy: String? = null,
    val verificationNotes: String? = null
)
