package org.aarogyalink.ui.screens

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
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
import org.aarogyalink.ui.theme.WarningAmberBg
import org.aarogyalink.ui.viewmodel.ReportViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResponderConsoleScreen(
    reportViewModel: ReportViewModel,
    onNavigateBack: () -> Unit
) {
    val reports by reportViewModel.allReports.collectAsState()
    var selectedIndex by remember { mutableStateOf(0) }
    var actionMessage by remember { mutableStateOf<String?>(null) }

    val scrollState = rememberScrollState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = "AAROGYA LINK ", fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = SuccessGreen)
                            Text(text = "Responder console", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Slate900)
                        }
                        Text(text = "District control room", fontSize = 10.sp, color = Slate500)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = SuccessGreenBg,
                        modifier = Modifier.padding(end = 12.dp)
                    ) {
                        Row(modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
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
            // Live Resources Counters
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Surface(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    color = UrgentRedBg
                ) {
                    Text(
                        text = "14 needs",
                        color = UrgentRed,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(vertical = 6.dp, horizontal = 10.dp)
                    )
                }

                Surface(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    color = SuccessGreenBg
                ) {
                    Text(
                        text = "9 offers",
                        color = SuccessGreen,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(vertical = 6.dp, horizontal = 10.dp)
                    )
                }

                Surface(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    color = Slate900
                ) {
                    Text(
                        text = "5 verified",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(vertical = 6.dp, horizontal = 10.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Incoming Requests Queue Header
            Text(
                text = "Incoming requests (14 open · sorted by urgency)",
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = Slate900
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Sample queue items matching PDF Page 5
            listOf(
                Triple("Insulin needed", "Ward 4 · 3 reports merged · 12 min ago", "Urgent"),
                Triple("Pregnancy care", "Ward 4 · field worker report · 25 min ago", "Critical"),
                Triple("Medicines", "Ward 3 · 1 report, no photo · 40 min ago", "Urgent"),
                Triple("Food, 200 packets", "Outside impact zone · repeated device", "Medium")
            ).forEachIndexed { idx, item ->
                val isSelected = selectedIndex == idx
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 3.dp)
                        .clickable { selectedIndex = idx },
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = if (isSelected) Color(0xFFEFF6FF) else Color.White),
                    border = androidx.compose.foundation.BorderStroke(if (isSelected) 2.dp else 1.dp, if (isSelected) BluePrimary else Slate300)
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            modifier = Modifier.size(32.dp),
                            shape = CircleShape,
                            color = if (item.first.contains("Food")) Slate700 else UrgentRed
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("●", color = Color.White, fontSize = 12.sp)
                            }
                        }

                        Spacer(modifier = Modifier.width(10.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = item.first, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Slate900)
                            Text(text = item.second, fontSize = 11.sp, color = Slate500)
                        }

                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (item.third == "Critical") UrgentRedBg else (if (item.third == "Urgent") WarningAmberBg else Slate100)
                        ) {
                            Text(
                                text = item.third,
                                color = if (item.third == "Critical") UrgentRed else (if (item.third == "Urgent") WarningAmber else Slate700),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Selected Report Verification Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, Slate300)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(text = "Insulin needed", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, color = Slate900)
                    Text(text = "3 people · Urgent · Ward 4 · device ending 4F2", fontSize = 11.sp, color = Slate500)

                    Spacer(modifier = Modifier.height(10.dp))

                    // Live Photo Waterline preview
                    Surface(
                        modifier = Modifier.fillMaxWidth().height(90.dp),
                        shape = RoundedCornerShape(10.dp),
                        color = Color(0xFF334155)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(text = "🏠  Live photo with waterline: 09:14 (example)", color = Color.White, fontSize = 11.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Verification checks
                    Text(text = "Verification checks", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Slate900)
                    Spacer(modifier = Modifier.height(4.dp))

                    listOf(
                        "✓ Location is inside the high impact zone",
                        "✓ Photo taken live, time and place match",
                        "✓ 3 separate devices reported within 200 m",
                        "✓ Request fits the area: flooded, medicine stock low",
                        "! New device with no report history"
                    ).forEach { check ->
                        val isAlert = check.startsWith("!")
                        Text(
                            text = check,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = if (isAlert) WarningAmber else SuccessGreen,
                            modifier = Modifier.padding(vertical = 1.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Trust Score Bar (78/100)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Trust score (AI-assisted)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate700)
                        Text(text = "78 / 100", fontSize = 12.sp, fontWeight = FontWeight.ExtraBold, color = Slate900)
                    }
                    LinearProgressIndicator(
                        progress = { 0.78f },
                        modifier = Modifier.fillMaxWidth().height(6.dp).padding(top = 2.dp),
                        color = SuccessGreen,
                        trackColor = Slate100
                    )
                    Text(
                        text = "AI only ranks and flags. A responder decides. Anyone flagged can appeal.",
                        fontSize = 10.sp,
                        color = Slate500,
                        modifier = Modifier.padding(top = 4.dp)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = SuccessGreenBg,
                        border = androidx.compose.foundation.BorderStroke(1.dp, SuccessGreen)
                    ) {
                        Text(
                            text = "Nearest match: Camp A has insulin (low stock), 1.1 km away.",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = SuccessGreen,
                            modifier = Modifier.padding(8.dp)
                        )
                    }

                    if (actionMessage != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(text = actionMessage!!, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = SuccessGreen)
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Action Buttons
                    Button(
                        onClick = { actionMessage = "✓ Verified and assigned to responder unit." },
                        modifier = Modifier.fillMaxWidth().height(44.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen)
                    ) {
                        Text("Verify and assign", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { actionMessage = "Additional information requested from reporter." },
                            modifier = Modifier.weight(1f).height(40.dp),
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(1.5.dp, Slate900)
                        ) {
                            Text("Ask info", color = Slate900, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }

                        OutlinedButton(
                            onClick = { actionMessage = "✕ Marked as false report." },
                            modifier = Modifier.weight(1f).height(40.dp),
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(1.5.dp, UrgentRed)
                        ) {
                            Text("Mark false", color = UrgentRed, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
