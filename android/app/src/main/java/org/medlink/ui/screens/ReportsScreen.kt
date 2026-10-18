package org.medlink.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.medlink.R
import org.medlink.data.local.ReportEntity
import org.medlink.data.local.SyncStatus
import org.medlink.data.local.VerificationStatus
import org.medlink.ui.theme.BluePrimary
import org.medlink.ui.theme.ResolvedCyan
import org.medlink.ui.theme.Slate100
import org.medlink.ui.theme.Slate300
import org.medlink.ui.theme.Slate500
import org.medlink.ui.theme.Slate700
import org.medlink.ui.theme.Slate900
import org.medlink.ui.theme.SuccessGreen
import org.medlink.ui.theme.SuccessGreenBg
import org.medlink.ui.theme.UnverifiedPurple
import org.medlink.ui.theme.UrgentRed
import org.medlink.ui.theme.UrgentRedBg
import org.medlink.ui.theme.WarningAmber
import org.medlink.ui.theme.WarningAmberBg
import org.medlink.ui.viewmodel.ReportViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyReportsScreen(
    viewModel: ReportViewModel,
    onNavigateBack: () -> Unit
) {
    val reports by viewModel.allReports.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = stringResource(R.string.my_reports), fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.pullStatusUpdates() }) {
                        Icon(imageVector = Icons.Default.Refresh, contentDescription = "Refresh from server", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = BluePrimary,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(padding)
                .padding(16.dp)
        ) {
            // Header information & Pull action
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${reports.size} Records Stored On Device",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = Slate500
                )
                Button(
                    onClick = { viewModel.pullStatusUpdates() },
                    colors = ButtonDefaults.buttonColors(containerColor = BluePrimary),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.height(36.dp)
                ) {
                    Icon(imageVector = Icons.Default.Sync, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "Check Server Status", fontSize = 12.sp)
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            if (reports.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.Schedule,
                            contentDescription = null,
                            tint = Slate300,
                            modifier = Modifier.size(64.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "No emergency reports recorded yet.",
                            style = MaterialTheme.typography.bodyLarge,
                            color = Slate500
                        )
                    }
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(reports, key = { it.reportId }) { report ->
                        ReportCard(
                            report = report,
                            onRetry = { viewModel.retrySync(report) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ReportCard(
    report: ReportEntity,
    onRetry: () -> Unit
) {
    val dateStr = SimpleDateFormat("dd MMM, hh:mm a", Locale.getDefault()).format(Date(report.createdAt))

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = report.emergencyType,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "ID: ${report.reportId.take(12)}... • $dateStr",
                        style = MaterialTheme.typography.bodySmall,
                        color = Slate500
                    )
                }

                // Urgency Pill
                val (urgencyColor, urgencyBg) = when (report.urgency.lowercase()) {
                    "high" -> UrgentRed to UrgentRedBg
                    "medium" -> WarningAmber to WarningAmberBg
                    else -> SuccessGreen to SuccessGreenBg
                }
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = urgencyBg,
                    modifier = Modifier.padding(start = 8.dp)
                ) {
                    Text(
                        text = report.urgency,
                        color = urgencyColor,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Location
            if (!report.locationName.isNullOrBlank() || (report.latitude != null && report.longitude != null)) {
                val locText = report.locationName ?: "GPS: ${report.latitude}, ${report.longitude}"
                Text(
                    text = "📍 $locText",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Slate700
                )
            }

            if (!report.description.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = report.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate500,
                    maxLines = 2
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Sync and Verification Status Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Sync status indicator
                Row(verticalAlignment = Alignment.CenterVertically) {
                    when (report.syncStatus) {
                        SyncStatus.RECEIVED_BY_SERVER -> {
                            Icon(imageVector = Icons.Default.CloudDone, contentDescription = "Synced", tint = SuccessGreen, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(text = "Server Received", color = SuccessGreen, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                        SyncStatus.SYNCING -> {
                            Icon(imageVector = Icons.Default.Sync, contentDescription = "Syncing", tint = BluePrimary, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(text = "Syncing...", color = BluePrimary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                        SyncStatus.SYNC_FAILED -> {
                            Icon(imageVector = Icons.Default.CloudOff, contentDescription = "Failed", tint = UrgentRed, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(text = "Sync Pending", color = UrgentRed, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                        SyncStatus.LOCAL_PENDING -> {
                            Icon(imageVector = Icons.Default.Schedule, contentDescription = "Local", tint = Slate500, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(text = "Saved Locally", color = Slate500, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }

                // Verification status badge
                val (verColor, verText) = when (report.verificationStatus) {
                    VerificationStatus.VERIFIED -> SuccessGreen to "VERIFIED"
                    VerificationStatus.RESOLVED -> ResolvedCyan to "RESOLVED"
                    VerificationStatus.REJECTED -> Slate500 to "REJECTED"
                    VerificationStatus.UNVERIFIED -> UnverifiedPurple to "UNVERIFIED"
                }

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = verColor.copy(alpha = 0.12f)
                ) {
                    Text(
                        text = verText,
                        color = verColor,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            // Responder Dispatch / Verification Notes
            if (!report.verificationNotes.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(10.dp))
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    color = SuccessGreenBg
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text(
                            text = "Responder Action (${report.verifiedBy ?: "Team"}):",
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            color = SuccessGreen
                        )
                        Text(
                            text = report.verificationNotes,
                            fontSize = 12.sp,
                            color = Slate900
                        )
                    }
                }
            }

            // Retry Button for failed uploads
            if (report.syncStatus == SyncStatus.SYNC_FAILED) {
                Spacer(modifier = Modifier.height(10.dp))
                Button(
                    onClick = onRetry,
                    colors = ButtonDefaults.buttonColors(containerColor = UrgentRed),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(40.dp)
                ) {
                    Icon(imageVector = Icons.Default.Sync, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "Retry Online Upload Now", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
