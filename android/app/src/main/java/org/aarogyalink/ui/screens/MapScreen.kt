package org.aarogyalink.ui.screens

import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Person
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
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.aarogyalink.ui.navigation.Screen
import org.aarogyalink.ui.theme.BluePrimary
import org.aarogyalink.ui.theme.Slate100
import org.aarogyalink.ui.theme.Slate300
import org.aarogyalink.ui.theme.Slate500
import org.aarogyalink.ui.theme.Slate700
import org.aarogyalink.ui.theme.Slate900
import org.aarogyalink.ui.theme.SuccessGreen
import org.aarogyalink.ui.theme.SuccessGreenBg
import org.aarogyalink.ui.theme.UrgentRed
import org.aarogyalink.ui.theme.UrgentRedBg
import org.aarogyalink.ui.theme.WarningAmber
import org.aarogyalink.ui.viewmodel.FacilitiesViewModel
import org.aarogyalink.ui.viewmodel.ReportViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmergencyMapScreen(
    reportViewModel: ReportViewModel,
    facilitiesViewModel: FacilitiesViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToRoute: (String) -> Unit = {}
) {
    var activeFilter by remember { mutableStateOf("All") }
    var selectedItem by remember { mutableStateOf("Insulin needed") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(text = "AAROGYA LINK", fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = SuccessGreen)
                        Text(text = "Area map", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Slate900)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = SuccessGreenBg,
                        modifier = Modifier.padding(end = 12.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(modifier = Modifier.size(6.dp).background(SuccessGreen, shape = CircleShape))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(text = "Online", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = SuccessGreen)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface,
                    navigationIconContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        },
        bottomBar = {
            // Bottom Navigation Bar matching PDF Page 1
            Surface(
                modifier = Modifier.fillMaxWidth().height(64.dp),
                color = Color.White,
                shadowElevation = 8.dp
            ) {
                Row(
                    modifier = Modifier.fillMaxSize(),
                    horizontalArrangement = Arrangement.SpaceAround,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.clickable { /* Active */ }
                    ) {
                        Icon(imageVector = Icons.Default.Map, contentDescription = "Map", tint = SuccessGreen)
                        Text(text = "Map", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = SuccessGreen)
                    }

                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.clickable { onNavigateToRoute(Screen.AddNeedOffer.route) }
                    ) {
                        Text("●", fontSize = 16.sp, color = UrgentRed, fontWeight = FontWeight.Bold)
                        Text(text = "Needs", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate700)
                    }

                    // Center camera circle
                    Surface(
                        modifier = Modifier.size(46.dp).clickable { onNavigateToRoute(Screen.LiveIncidentCamera.route) },
                        shape = CircleShape,
                        color = Slate900,
                        shadowElevation = 4.dp
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(imageVector = Icons.Default.CameraAlt, contentDescription = "Camera", tint = Color.White)
                        }
                    }

                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.clickable { onNavigateToRoute(Screen.AddNeedOffer.route) }
                    ) {
                        Text("■", fontSize = 14.sp, color = SuccessGreen, fontWeight = FontWeight.Bold)
                        Text(text = "Offers", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate700)
                    }

                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.clickable { onNavigateToRoute(Screen.MyReports.route) }
                    ) {
                        Icon(imageVector = Icons.Default.Person, contentDescription = "Me", tint = Slate500)
                        Text(text = "Me", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate700)
                    }
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(padding)
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            // Filter Pills: All, Needs, Offers, Roads
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("All", "Needs", "Offers", "Roads").forEach { flt ->
                    val isActive = activeFilter == flt
                    Surface(
                        modifier = Modifier
                            .weight(1f)
                            .height(36.dp)
                            .clickable {
                                activeFilter = flt
                                if (flt == "Roads") {
                                    onNavigateToRoute(Screen.RoadsTransport.route)
                                }
                            },
                        shape = RoundedCornerShape(18.dp),
                        color = if (isActive) Slate900 else Color.White,
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (isActive) Slate900 else Slate300)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = flt,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isActive) Color.White else Slate900
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Map Box with concentric impact zones and Red Circle needs / Green Square offers
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(290.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFE2E8F0)),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate300)
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    // Canvas drawing concentric impact probability zones
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        val centerX = size.width * 0.52f
                        val centerY = size.height * 0.54f

                        // Outer Low impact circle (Blue dashed)
                        drawCircle(
                            color = Color(0xFF93C5FD).copy(alpha = 0.25f),
                            radius = 140.dp.toPx(),
                            center = Offset(centerX, centerY)
                        )
                        drawCircle(
                            color = Color(0xFF3B82F6),
                            radius = 140.dp.toPx(),
                            center = Offset(centerX, centerY),
                            style = Stroke(width = 2.dp.toPx(), pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f), 0f))
                        )

                        // Medium impact circle (Amber)
                        drawCircle(
                            color = Color(0xFFFDE68A).copy(alpha = 0.45f),
                            radius = 85.dp.toPx(),
                            center = Offset(centerX, centerY)
                        )

                        // High impact circle (Red)
                        drawCircle(
                            color = Color(0xFFFCA5A5).copy(alpha = 0.65f),
                            radius = 45.dp.toPx(),
                            center = Offset(centerX, centerY)
                        )
                    }

                    // Impact Probability Legend (Top Left)
                    Surface(
                        modifier = Modifier.padding(10.dp).align(Alignment.TopStart),
                        shape = RoundedCornerShape(8.dp),
                        color = Color.White.copy(alpha = 0.95f),
                        shadowElevation = 2.dp
                    ) {
                        Column(modifier = Modifier.padding(6.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            Text(text = "Impact probability", fontWeight = FontWeight.ExtraBold, fontSize = 9.sp, color = Slate900)
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.size(8.dp).background(UrgentRed, shape = RoundedCornerShape(2.dp)))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("High", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate700)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.size(8.dp).background(WarningAmber, shape = RoundedCornerShape(2.dp)))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Medium", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate700)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.size(8.dp).background(Color(0xFFEAB308), shape = RoundedCornerShape(2.dp)))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Low", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate700)
                            }
                            Text(text = "Circle = need\nSquare = offer", fontSize = 8.sp, color = Slate500, lineHeight = 10.sp)
                        }
                    }

                    // Estimated Affected Area Badge (Top Right)
                    Surface(
                        modifier = Modifier.padding(10.dp).align(Alignment.TopEnd),
                        shape = RoundedCornerShape(8.dp),
                        color = Color.White.copy(alpha = 0.95f),
                        shadowElevation = 2.dp
                    ) {
                        Column(modifier = Modifier.padding(6.dp), horizontalAlignment = Alignment.End) {
                            Text(text = "Estimated affected area", fontSize = 8.sp, color = Slate500)
                            Text(text = "~2.4 km²", fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, color = Slate900)
                            Text(text = "AI estimate. Sample data.", fontSize = 7.sp, color = Slate500)
                        }
                    }

                    // Need Marker: Red Circle (●)
                    Surface(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(end = 30.dp)
                            .size(34.dp)
                            .clickable { selectedItem = "Insulin needed" },
                        shape = CircleShape,
                        color = UrgentRed,
                        border = androidx.compose.foundation.BorderStroke(2.dp, Color.White),
                        shadowElevation = 4.dp
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text("💧", fontSize = 14.sp)
                        }
                    }

                    // Offer Marker: Green Square (■)
                    Surface(
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                            .padding(top = 80.dp, start = 80.dp)
                            .size(34.dp)
                            .clickable { selectedItem = "Camp A: insulin low" },
                        shape = RoundedCornerShape(8.dp),
                        color = SuccessGreen,
                        border = androidx.compose.foundation.BorderStroke(2.dp, Color.White),
                        shadowElevation = 4.dp
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text("▲", fontSize = 14.sp, color = Color.White)
                        }
                    }

                    // Ambulance Offer Marker: Green Square (■)
                    Surface(
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                            .padding(top = 90.dp, end = 20.dp)
                            .size(32.dp),
                        shape = RoundedCornerShape(8.dp),
                        color = SuccessGreen,
                        border = androidx.compose.foundation.BorderStroke(2.dp, Color.White),
                        shadowElevation = 4.dp
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text("🚑", fontSize = 13.sp)
                        }
                    }

                    // Water 200L Offer: Green Square
                    Surface(
                        modifier = Modifier
                            .align(Alignment.CenterStart)
                            .padding(start = 30.dp)
                            .size(32.dp),
                        shape = RoundedCornerShape(8.dp),
                        color = SuccessGreen,
                        border = androidx.compose.foundation.BorderStroke(2.dp, Color.White),
                        shadowElevation = 4.dp
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text("🍶", fontSize = 13.sp)
                        }
                    }

                    // Ward 4 text
                    Text(
                        text = "Ward 4",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate700,
                        modifier = Modifier.align(Alignment.BottomStart).padding(start = 24.dp, bottom = 24.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Selected Incident Details Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate300),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            modifier = Modifier.size(38.dp),
                            shape = CircleShape,
                            color = UrgentRed
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("💧", fontSize = 16.sp)
                            }
                        }

                        Spacer(modifier = Modifier.width(10.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(text = selectedItem, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, color = Slate900)
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = UrgentRedBg
                                ) {
                                    Text(text = "Urgent", color = UrgentRed, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                                }
                            }
                            Text(text = "Ward 4 · 3 reports within 200 m · 1 live photo", fontSize = 11.sp, color = Slate500)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = Color.White,
                            border = androidx.compose.foundation.BorderStroke(1.dp, Slate500)
                        ) {
                            Text(text = "Unverified", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate700, modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp))
                        }

                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = SuccessGreenBg,
                            border = androidx.compose.foundation.BorderStroke(1.dp, SuccessGreen)
                        ) {
                            Text(text = "AI check: likely genuine", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = SuccessGreen, modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp))
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Buttons: Green "I can help" & White "Details"
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = { onNavigateToRoute(Screen.AddNeedOffer.route) },
                            modifier = Modifier.weight(1f).height(44.dp),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen)
                        ) {
                            Text("I can help", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }

                        OutlinedButton(
                            onClick = { onNavigateToRoute(Screen.MyReports.route) },
                            modifier = Modifier.weight(1f).height(44.dp),
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(1.5.dp, Slate900)
                        ) {
                            Text("Details", color = Slate900, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                }
            }
        }
    }
}
