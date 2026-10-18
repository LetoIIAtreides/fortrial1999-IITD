package org.medlink.data.local

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext

class MedLinkDatabaseHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        private const val DATABASE_NAME = "med_link.db"
        private const val DATABASE_VERSION = 1

        const val TABLE_REPORTS = "reports"
        const val COL_REPORT_ID = "report_id"
        const val COL_EMERGENCY_TYPE = "emergency_type"
        const val COL_URGENCY = "urgency"
        const val COL_CREATED_AT = "created_at"
        const val COL_LATITUDE = "latitude"
        const val COL_LONGITUDE = "longitude"
        const val COL_LOCATION_NAME = "location_name"
        const val COL_DESCRIPTION = "description"
        const val COL_SYNC_STATUS = "sync_status"
        const val COL_VERIFICATION_STATUS = "verification_status"
        const val COL_LAST_SYNCED_AT = "last_synced_at"
        const val COL_VERIFIED_BY = "verified_by"
        const val COL_VERIFICATION_NOTES = "verification_notes"

        @Volatile
        private var INSTANCE: MedLinkDatabaseHelper? = null

        fun getInstance(context: Context): MedLinkDatabaseHelper {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: MedLinkDatabaseHelper(context.applicationContext).also { INSTANCE = it }
            }
        }
    }

    private val _reportsFlow = MutableStateFlow<List<ReportEntity>>(emptyList())
    val reportsFlow: Flow<List<ReportEntity>> = _reportsFlow.asStateFlow()

    init {
        refreshFlow()
    }

    override fun onCreate(db: SQLiteDatabase) {
        val createQuery = """
            CREATE TABLE $TABLE_REPORTS (
                $COL_REPORT_ID TEXT PRIMARY KEY,
                $COL_EMERGENCY_TYPE TEXT NOT NULL,
                $COL_URGENCY TEXT NOT NULL,
                $COL_CREATED_AT INTEGER NOT NULL,
                $COL_LATITUDE REAL,
                $COL_LONGITUDE REAL,
                $COL_LOCATION_NAME TEXT,
                $COL_DESCRIPTION TEXT,
                $COL_SYNC_STATUS TEXT NOT NULL,
                $COL_VERIFICATION_STATUS TEXT NOT NULL,
                $COL_LAST_SYNCED_AT INTEGER,
                $COL_VERIFIED_BY TEXT,
                $COL_VERIFICATION_NOTES TEXT
            )
        """.trimIndent()
        db.execSQL(createQuery)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS $TABLE_REPORTS")
        onCreate(db)
    }

    private fun refreshFlow() {
        val list = getAllReportsSync()
        _reportsFlow.value = list
    }

    suspend fun insertOrUpdate(report: ReportEntity): Long = withContext(Dispatchers.IO) {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COL_REPORT_ID, report.reportId)
            put(COL_EMERGENCY_TYPE, report.emergencyType)
            put(COL_URGENCY, report.urgency)
            put(COL_CREATED_AT, report.createdAt)
            put(COL_LATITUDE, report.latitude)
            put(COL_LONGITUDE, report.longitude)
            put(COL_LOCATION_NAME, report.locationName)
            put(COL_DESCRIPTION, report.description)
            put(COL_SYNC_STATUS, report.syncStatus.name)
            put(COL_VERIFICATION_STATUS, report.verificationStatus.name)
            put(COL_LAST_SYNCED_AT, report.lastSyncedAt)
            put(COL_VERIFIED_BY, report.verifiedBy)
            put(COL_VERIFICATION_NOTES, report.verificationNotes)
        }
        val result = db.insertWithOnConflict(TABLE_REPORTS, null, values, SQLiteDatabase.CONFLICT_REPLACE)
        refreshFlow()
        result
    }

    suspend fun getReportById(reportId: String): ReportEntity? = withContext(Dispatchers.IO) {
        val db = readableDatabase
        val cursor = db.query(
            TABLE_REPORTS,
            null,
            "$COL_REPORT_ID = ?",
            arrayOf(reportId),
            null,
            null,
            null
        )
        cursor.use {
            if (it.moveToFirst()) cursorToEntity(it) else null
        }
    }

    suspend fun getPendingReports(): List<ReportEntity> = withContext(Dispatchers.IO) {
        val db = readableDatabase
        val cursor = db.query(
            TABLE_REPORTS,
            null,
            "$COL_SYNC_STATUS IN (?, ?)",
            arrayOf(SyncStatus.LOCAL_PENDING.name, SyncStatus.SYNC_FAILED.name),
            null,
            null,
            "$COL_CREATED_AT ASC"
        )
        cursor.use {
            val list = mutableListOf<ReportEntity>()
            while (it.moveToNext()) {
                list.add(cursorToEntity(it))
            }
            list
        }
    }

    private fun getAllReportsSync(): List<ReportEntity> {
        val db = readableDatabase
        val cursor = db.query(
            TABLE_REPORTS,
            null,
            null,
            null,
            null,
            null,
            "$COL_CREATED_AT DESC"
        )
        return cursor.use {
            val list = mutableListOf<ReportEntity>()
            while (it.moveToNext()) {
                list.add(cursorToEntity(it))
            }
            list
        }
    }

    private fun cursorToEntity(cursor: Cursor): ReportEntity {
        val id = cursor.getString(cursor.getColumnIndexOrThrow(COL_REPORT_ID))
        val type = cursor.getString(cursor.getColumnIndexOrThrow(COL_EMERGENCY_TYPE))
        val urgency = cursor.getString(cursor.getColumnIndexOrThrow(COL_URGENCY))
        val createdAt = cursor.getLong(cursor.getColumnIndexOrThrow(COL_CREATED_AT))

        val latIdx = cursor.getColumnIndexOrThrow(COL_LATITUDE)
        val lat = if (cursor.isNull(latIdx)) null else cursor.getDouble(latIdx)

        val lngIdx = cursor.getColumnIndexOrThrow(COL_LONGITUDE)
        val lng = if (cursor.isNull(lngIdx)) null else cursor.getDouble(lngIdx)

        val locIdx = cursor.getColumnIndexOrThrow(COL_LOCATION_NAME)
        val loc = if (cursor.isNull(locIdx)) null else cursor.getString(locIdx)

        val descIdx = cursor.getColumnIndexOrThrow(COL_DESCRIPTION)
        val desc = if (cursor.isNull(descIdx)) null else cursor.getString(descIdx)

        val syncStatusStr = cursor.getString(cursor.getColumnIndexOrThrow(COL_SYNC_STATUS))
        val syncStatus = try { SyncStatus.valueOf(syncStatusStr) } catch (_: Exception) { SyncStatus.LOCAL_PENDING }

        val verStatusStr = cursor.getString(cursor.getColumnIndexOrThrow(COL_VERIFICATION_STATUS))
        val verStatus = try { VerificationStatus.valueOf(verStatusStr) } catch (_: Exception) { VerificationStatus.UNVERIFIED }

        val syncAtIdx = cursor.getColumnIndexOrThrow(COL_LAST_SYNCED_AT)
        val lastSyncedAt = if (cursor.isNull(syncAtIdx)) null else cursor.getLong(syncAtIdx)

        val verByIdx = cursor.getColumnIndexOrThrow(COL_VERIFIED_BY)
        val verifiedBy = if (cursor.isNull(verByIdx)) null else cursor.getString(verByIdx)

        val verNotesIdx = cursor.getColumnIndexOrThrow(COL_VERIFICATION_NOTES)
        val verificationNotes = if (cursor.isNull(verNotesIdx)) null else cursor.getString(verNotesIdx)

        return ReportEntity(
            reportId = id,
            emergencyType = type,
            urgency = urgency,
            createdAt = createdAt,
            latitude = lat,
            longitude = lng,
            locationName = loc,
            description = desc,
            syncStatus = syncStatus,
            verificationStatus = verStatus,
            lastSyncedAt = lastSyncedAt,
            verifiedBy = verifiedBy,
            verificationNotes = verificationNotes
        )
    }
}
