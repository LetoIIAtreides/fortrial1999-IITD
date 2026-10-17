package org.aarogyalink.ui.screens

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Shield
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
import org.aarogyalink.R
import org.aarogyalink.ui.theme.BlueLight
import org.aarogyalink.ui.theme.BluePrimary
import org.aarogyalink.ui.theme.Slate100
import org.aarogyalink.ui.theme.Slate300
import org.aarogyalink.ui.theme.Slate500
import org.aarogyalink.ui.theme.Slate700
import org.aarogyalink.ui.theme.Slate900
import org.aarogyalink.ui.theme.SuccessGreen
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
    onNavigateBack: () -> Unit
) {
    val facilities by facilitiesViewModel.facilities.collectAsState()
    val reports by reportViewModel.allReports.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = stringResource(R.string.emergency_map), fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
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
            // Visual Map Representation Card with Privacy Notice
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                ) {
                    Column(modifier = Modifier.align(Alignment.TopStart)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.Map, contentDescription = null, tint = BluePrimary, modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(text = "Himalayan Disaster Response Grid", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 15.sp)
                        }
                        Text(
                            text = "Coverage: Chamoli, Rudraprayag & Dehradun regions",
                            color = Slate300,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }

                    // Map Pins Summary
                    Row(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(modifier = Modifier.size(10.dp).background(BluePrimary, CircleShape))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(text = "${facilities.size} Facilities", color = Color.White, fontSize = 12.sp)

                            Spacer(modifier = Modifier.width(16.dp))

                            Box(modifier = Modifier.size(10.dp).background(UrgentRed, CircleShape))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(text = "${reports.size} Reports", color = Color.White, fontSize = 12.sp)
                        }

                        Surface(shape = RoundedCornerShape(12.dp), color = Color.White.copy(alpha = 0.15f)) {
                            Row(modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(imageVector = Icons.Default.Shield, contentDescription = null, tint = SuccessGreen, modifier = Modifier.size(12.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(text = "Privacy Protected", color = Color.White, fontSize = 10.sp)
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Nearby Active Hotspots & Facilities",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )

            Spacer(modifier = Modifier.height(10.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(facilities) { fac ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                            Surface(modifier = Modifier.size(36.dp), shape = CircleShape, color = BlueLight) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(imageVector = Icons.Default.LocalHospital, contentDescription = null, tint = BluePrimary, modifier = Modifier.size(20.dp))
                                }
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = fac.name, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurface)
                                Text(text = "${fac.district} • GPS: ${fac.latitude}, ${fac.longitude}", fontSize = 12.sp, color = Slate500)
                            }
                        }
                    }
                }

                items(reports) { rep ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                            Surface(modifier = Modifier.size(36.dp), shape = CircleShape, color = UrgentRedBg) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(imageVector = Icons.Default.LocationOn, contentDescription = null, tint = UrgentRed, modifier = Modifier.size(20.dp))
                                }
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = "${rep.emergencyType} (${rep.urgency} Urgency)", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurface)
                                val coarseLoc = rep.locationName ?: if (rep.latitude != null) "Coarse: ${rep.latitude}, ${rep.longitude}" else "Location not specified"
                                Text(text = coarseLoc, fontSize = 12.sp, color = Slate500)
                            }
                        }
                    }
                }
            }
        }
    }
}
