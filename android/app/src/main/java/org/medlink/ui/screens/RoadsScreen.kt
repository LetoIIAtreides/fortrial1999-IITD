package org.medlink.ui.screens

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
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.DirectionsBoat
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.medlink.ui.theme.BluePrimary
import org.medlink.ui.theme.Slate100
import org.medlink.ui.theme.Slate300
import org.medlink.ui.theme.Slate500
import org.medlink.ui.theme.Slate700
import org.medlink.ui.theme.Slate900
import org.medlink.ui.theme.SuccessGreen
import org.medlink.ui.theme.SuccessGreenBg
import org.medlink.ui.theme.UrgentRed
import org.medlink.ui.theme.UrgentRedBg
import org.medlink.ui.theme.WarningAmber
import org.medlink.ui.theme.WarningAmberBg

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RoadsTransportScreen(
    onNavigateBack: () -> Unit,
    onRequestBoat: () -> Unit
) {
    var boatRequested by remember { mutableStateOf(false) }
    var roadReported by remember { mutableStateOf(false) }

    val scrollState = rememberScrollState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = "Roads and transport", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Slate100,
                        modifier = Modifier.padding(end = 12.dp)
                    ) {
                        Text(
                            text = "Sample data",
                            color = Slate700,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface,
                    navigationIconContentColor = MaterialTheme.colorScheme.onSurface
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
                .verticalScroll(scrollState)
        ) {
            // Road Network Diagram Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Slate100),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate300)
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    // River overlay
                    Surface(
                        modifier = Modifier.fillMaxWidth().height(45.dp).align(Alignment.Center),
                        color = Color(0xFFBFDBFE).copy(alpha = 0.5f)
                    ) {}

                    // Road Status Legend
                    Surface(
                        modifier = Modifier.padding(10.dp).align(Alignment.TopStart),
                        shape = RoundedCornerShape(8.dp),
                        color = Color.White.copy(alpha = 0.95f),
                        shadowElevation = 2.dp
                    ) {
                        Column(modifier = Modifier.padding(8.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            Text(text = "Road status", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = Slate900)
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.size(12.dp, 3.dp).background(SuccessGreen))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Open", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = SuccessGreen)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.size(12.dp, 3.dp).background(WarningAmber))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Risky", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = WarningAmber)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.size(12.dp, 3.dp).background(UrgentRed))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Blocked", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = UrgentRed)
                            }
                        }
                    }

                    // Landmarks
                    Text(
                        text = "You ●",
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        color = BluePrimary,
                        modifier = Modifier.align(Alignment.BottomStart).padding(20.dp)
                    )

                    Text(
                        text = "▲ Camp A",
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        color = SuccessGreen,
                        modifier = Modifier.align(Alignment.Center).padding(start = 20.dp)
                    )

                    Text(
                        text = "✚ Town hospital",
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        color = SuccessGreen,
                        modifier = Modifier.align(Alignment.TopEnd).padding(14.dp)
                    )

                    // Blocked Bridge Callout
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = UrgentRedBg,
                        border = androidx.compose.foundation.BorderStroke(1.dp, UrgentRed),
                        modifier = Modifier.align(Alignment.CenterStart).padding(start = 12.dp, top = 20.dp)
                    ) {
                        Text(
                            text = "✕ Bridge 1 blocked",
                            color = UrgentRed,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Way to Town hospital
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Text(text = "Way to Town hospital", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Slate900)
                Text(text = "about 9 km", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Slate500)
            }
            Text(
                text = "Road status comes from live reports. Reports older than 3 hours turn grey.",
                fontSize = 11.sp,
                color = Slate500,
                modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
            )

            // Transport Option Cards
            TransitOptionCard(
                icon = Icons.Default.DirectionsBoat,
                title = "Boat",
                badgeText = "Best option",
                badgeColor = SuccessGreen,
                desc = "2 boats at the ghat, 8 seats. About 1 h 20 min.",
                statusText = "✓ Open",
                statusBg = SuccessGreenBg,
                statusColor = SuccessGreen,
                isHighlight = true
            )

            Spacer(modifier = Modifier.height(8.dp))

            TransitOptionCard(
                icon = Icons.Default.DirectionsWalk,
                title = "Walk",
                desc = "Road C has water 0.3 m. About 2 h 10 min. Avoid at night.",
                statusText = "! Risky",
                statusBg = WarningAmberBg,
                statusColor = WarningAmber
            )

            Spacer(modifier = Modifier.height(8.dp))

            TransitOptionCard(
                icon = Icons.Default.LocalShipping,
                title = "Truck or tractor",
                desc = "Bridge 1 blocked, water 0.8 m. 3 reports, 20 min ago.",
                statusText = "✕ Blocked",
                statusBg = UrgentRedBg,
                statusColor = UrgentRed
            )

            Spacer(modifier = Modifier.height(8.dp))

            TransitOptionCard(
                icon = Icons.Default.LocalHospital,
                title = "Ambulance (4x4)",
                desc = "Waiting at Camp A. Can go once Road C is open.",
                statusText = "! Waiting",
                statusBg = WarningAmberBg,
                statusColor = WarningAmber
            )

            if (boatRequested) {
                Spacer(modifier = Modifier.height(12.dp))
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = SuccessGreenBg,
                    border = androidx.compose.foundation.BorderStroke(1.dp, SuccessGreen)
                ) {
                    Text(
                        text = "✓ Boat request registered on server. Town Ghat dispatch coordinator notified.",
                        color = SuccessGreen,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(10.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Action Buttons: Green "Request boat" & White "Report road"
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = {
                        boatRequested = true
                        onRequestBoat()
                    },
                    modifier = Modifier.weight(1f).height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen)
                ) {
                    Text(text = "Request boat", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }

                OutlinedButton(
                    onClick = {
                        roadReported = true
                    },
                    modifier = Modifier.weight(1f).height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, Slate900)
                ) {
                    Icon(imageVector = Icons.Default.CameraAlt, contentDescription = null, tint = Slate900)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "Report road", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Slate900)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun TransitOptionCard(
    icon: ImageVector,
    title: String,
    desc: String,
    statusText: String,
    statusBg: Color,
    statusColor: Color,
    badgeText: String? = null,
    badgeColor: Color = SuccessGreen,
    isHighlight: Boolean = false
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = if (isHighlight) SuccessGreenBg.copy(alpha = 0.5f) else Color.White),
        border = androidx.compose.foundation.BorderStroke(if (isHighlight) 2.dp else 1.dp, if (isHighlight) SuccessGreen else Slate300)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                modifier = Modifier.size(42.dp),
                shape = RoundedCornerShape(10.dp),
                color = if (isHighlight) Slate900 else Slate100
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = if (isHighlight) Color.White else Slate700
                    )
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Slate900)
                    if (badgeText != null) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = badgeColor
                        ) {
                            Text(
                                text = badgeText,
                                color = Color.White,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 1.dp)
                            )
                        }
                    }
                }
                Text(text = desc, fontSize = 11.sp, color = Slate500, modifier = Modifier.padding(top = 2.dp))
            }

            Surface(
                shape = RoundedCornerShape(12.dp),
                color = statusBg
            ) {
                Text(
                    text = statusText,
                    color = statusColor,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }
    }
}
