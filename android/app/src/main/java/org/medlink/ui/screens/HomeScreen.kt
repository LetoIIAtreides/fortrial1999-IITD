package org.medlink.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.DirectionsBoat
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.medlink.R
import org.medlink.ui.navigation.Screen
import org.medlink.ui.theme.BlueLight
import org.medlink.ui.theme.BluePrimary
import org.medlink.ui.theme.Slate100
import org.medlink.ui.theme.Slate300
import org.medlink.ui.theme.Slate500
import org.medlink.ui.theme.Slate900
import org.medlink.ui.theme.SuccessGreen
import org.medlink.ui.theme.SuccessGreenBg
import org.medlink.ui.theme.UrgentRed
import org.medlink.ui.theme.UrgentRedBg
import org.medlink.ui.viewmodel.ReportViewModel

@Composable
fun HomeScreen(
    viewModel: ReportViewModel,
    onNavigate: (String) -> Unit
) {
    val context = LocalContext.current
    val isOnline by viewModel.isOnline.collectAsState()
    val reports by viewModel.allReports.collectAsState()
    val pendingCount = reports.count { it.syncStatus.name != "RECEIVED_BY_SERVER" }
    val currentLang by viewModel.currentLanguage.collectAsState()

    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
            .verticalScroll(scrollState)
    ) {
        // 1. Top Bar: Brand, Language Selector & Spoken Label
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    modifier = Modifier.size(44.dp),
                    shape = RoundedCornerShape(12.dp),
                    color = BluePrimary
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.HealthAndSafety,
                            contentDescription = "MED-LINK Logo",
                            tint = Color.White,
                            modifier = Modifier.size(26.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = stringResource(R.string.app_name),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    Text(
                        text = stringResource(R.string.tagline),
                        style = MaterialTheme.typography.bodyMedium,
                        color = BluePrimary,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Language switcher + TTS readout
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(
                    onClick = {
                        val welcomeText = if (currentLang == "hi") {
                            "मेड-लिंक आपातकालीन पोर्टल में आपका स्वागत है।"
                        } else {
                            "Welcome to MED-LINK emergency portal. Share help, save lives."
                        }
                        viewModel.speak(welcomeText)
                    },
                    modifier = Modifier.size(48.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.VolumeUp,
                        contentDescription = stringResource(R.string.listen_audio),
                        tint = BluePrimary
                    )
                }

                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Slate100,
                    modifier = Modifier.clickable {
                        viewModel.setLanguage(if (currentLang == "en") "hi" else "en")
                    }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (currentLang == "hi") "हिन्दी" else "EN",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = Slate900
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 2. Connectivity & Sync Status Bar
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            color = if (isOnline) SuccessGreenBg else UrgentRedBg
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .background(
                                color = if (isOnline) SuccessGreen else UrgentRed,
                                shape = CircleShape
                            )
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (isOnline) stringResource(R.string.status_online) else stringResource(R.string.status_offline),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = if (isOnline) SuccessGreen else UrgentRed
                    )
                }

                if (pendingCount > 0) {
                    Text(
                        text = "$pendingCount pending sync",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        color = UrgentRed
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 3. Urgent 112 Phone Call Notice
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = UrgentRedBg)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = "Alert",
                        tint = UrgentRed,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = stringResource(R.string.emergency_call_notice),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium,
                        color = UrgentRed
                    )
                }
                Spacer(modifier = Modifier.height(10.dp))
                Button(
                    onClick = {
                        val dialIntent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:112"))
                        context.startActivity(dialIntent)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = UrgentRed),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                ) {
                    Icon(imageVector = Icons.Default.Call, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = stringResource(R.string.call_112),
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 3b. Red / Green Quick Actions (Red Circle = Need Help, Green Square = Give Help)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Button(
                onClick = { onNavigate(Screen.AddNeedOffer.route) },
                colors = ButtonDefaults.buttonColors(containerColor = UrgentRed),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .weight(1f)
                    .height(50.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .background(Color.White, CircleShape)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "I Need Help",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = Color.White
                    )
                }
            }

            Button(
                onClick = { onNavigate(Screen.AddNeedOffer.route) },
                colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .weight(1f)
                    .height(50.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .background(Color.White, RoundedCornerShape(2.dp))
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "I Can Give Help",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = Color.White
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 4. Primary Actions
        ActionMenuCard(
            title = stringResource(R.string.report_emergency),
            subtitle = stringResource(R.string.report_emergency_desc),
            icon = Icons.Default.NotificationsActive,
            iconTint = Color.White,
            cardBg = BluePrimary,
            titleColor = Color.White,
            subtitleColor = Slate100,
            onClick = { onNavigate(Screen.ReportEmergency.route) }
        )

        Spacer(modifier = Modifier.height(12.dp))

        ActionMenuCard(
            title = stringResource(R.string.my_reports),
            subtitle = stringResource(R.string.my_reports_desc),
            icon = Icons.Default.Sync,
            iconTint = BluePrimary,
            cardBg = MaterialTheme.colorScheme.surface,
            titleColor = MaterialTheme.colorScheme.onSurface,
            subtitleColor = Slate500,
            onClick = { onNavigate(Screen.MyReports.route) }
        )

        Spacer(modifier = Modifier.height(12.dp))

        ActionMenuCard(
            title = stringResource(R.string.emergency_map),
            subtitle = stringResource(R.string.emergency_map_desc),
            icon = Icons.Default.Map,
            iconTint = BluePrimary,
            cardBg = MaterialTheme.colorScheme.surface,
            titleColor = MaterialTheme.colorScheme.onSurface,
            subtitleColor = Slate500,
            onClick = { onNavigate(Screen.EmergencyMap.route) }
        )

        Spacer(modifier = Modifier.height(12.dp))

        ActionMenuCard(
            title = "Roads and transport",
            subtitle = "Way to hospital (9 km), boats, route clearance",
            icon = Icons.Default.DirectionsBoat,
            iconTint = BluePrimary,
            cardBg = MaterialTheme.colorScheme.surface,
            titleColor = MaterialTheme.colorScheme.onSurface,
            subtitleColor = Slate500,
            onClick = { onNavigate(Screen.RoadsTransport.route) }
        )

        Spacer(modifier = Modifier.height(12.dp))

        ActionMenuCard(
            title = "Live incident camera",
            subtitle = "Waterline watermark & verified photo evidence",
            icon = Icons.Default.CameraAlt,
            iconTint = BluePrimary,
            cardBg = MaterialTheme.colorScheme.surface,
            titleColor = MaterialTheme.colorScheme.onSurface,
            subtitleColor = Slate500,
            onClick = { onNavigate(Screen.LiveIncidentCamera.route) }
        )

        Spacer(modifier = Modifier.height(12.dp))

        ActionMenuCard(
            title = stringResource(R.string.healthcare_facilities),
            subtitle = stringResource(R.string.healthcare_facilities_desc),
            icon = Icons.Default.LocalHospital,
            iconTint = BluePrimary,
            cardBg = MaterialTheme.colorScheme.surface,
            titleColor = MaterialTheme.colorScheme.onSurface,
            subtitleColor = Slate500,
            onClick = { onNavigate(Screen.HealthcareFacilities.route) }
        )

        Spacer(modifier = Modifier.height(12.dp))

        ActionMenuCard(
            title = "Responder console",
            subtitle = "District control room, trust score & triage",
            icon = Icons.Default.Security,
            iconTint = BluePrimary,
            cardBg = MaterialTheme.colorScheme.surface,
            titleColor = MaterialTheme.colorScheme.onSurface,
            subtitleColor = Slate500,
            onClick = { onNavigate(Screen.ResponderConsole.route) }
        )

        Spacer(modifier = Modifier.height(12.dp))

        ActionMenuCard(
            title = stringResource(R.string.help_information),
            subtitle = stringResource(R.string.help_information_desc),
            icon = Icons.Default.Info,
            iconTint = BluePrimary,
            cardBg = MaterialTheme.colorScheme.surface,
            titleColor = MaterialTheme.colorScheme.onSurface,
            subtitleColor = Slate500,
            onClick = { onNavigate(Screen.HelpInfo.route) }
        )

        Spacer(modifier = Modifier.height(20.dp))
    }
}

@Composable
fun ActionMenuCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    iconTint: Color,
    cardBg: Color,
    titleColor: Color,
    subtitleColor: Color,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(84.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = cardBg),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 18.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                modifier = Modifier.size(48.dp),
                shape = RoundedCornerShape(12.dp),
                color = if (cardBg == BluePrimary) Color.White.copy(alpha = 0.2f) else BlueLight
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(imageVector = icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(24.dp))
                }
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = titleColor)
                Spacer(modifier = Modifier.height(2.dp))
                Text(text = subtitle, style = MaterialTheme.typography.bodyMedium, color = subtitleColor, maxLines = 1)
            }
        }
    }
}
