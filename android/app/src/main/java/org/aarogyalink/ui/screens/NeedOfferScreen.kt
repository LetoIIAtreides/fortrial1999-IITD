package org.aarogyalink.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Mic
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
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
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
import org.aarogyalink.ui.viewmodel.ReportViewModel

data class NeedCategory(val id: String, val label: String, val icon: String)

val NEED_CATEGORIES = listOf(
    NeedCategory("Insulin", "Insulin", "💧"),
    NeedCategory("Medicines", "Medicines", "💊"),
    NeedCategory("Pregnancy", "Pregnancy", "🤰"),
    NeedCategory("First aid", "First aid", "✚"),
    NeedCategory("Clean water", "Clean water", "🍶"),
    NeedCategory("Food", "Food", "🍲"),
    NeedCategory("Blankets", "Blankets", "🛏️"),
    NeedCategory("Oxygen", "Oxygen", "🤿"),
    NeedCategory("Transport", "Transport", "🚐")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddNeedOfferScreen(
    viewModel: ReportViewModel,
    onNavigateBack: () -> Unit,
    onOpenLiveCamera: () -> Unit,
    onSubmitted: () -> Unit
) {
    var isNeedMode by remember { mutableStateOf(true) }
    val selectedCats = remember { mutableStateListOf("Insulin", "Medicines") }
    var peopleCount by remember { mutableStateOf(3) }
    var urgency by remember { mutableStateOf("Urgent") }
    var ward by remember { mutableStateOf("Ward 4") }
    var hasPhoto by remember { mutableStateOf(false) }
    var voiceAttached by remember { mutableStateOf(false) }

    val scrollState = rememberScrollState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = "Add to the map", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
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
            // Choice Toggle: I need help (Red) vs I can give help (Green)
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                color = Color.White,
                border = androidx.compose.foundation.BorderStroke(1.5.dp, Slate300)
            ) {
                Row(modifier = Modifier.padding(4.dp)) {
                    Surface(
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp)
                            .clickable { isNeedMode = true },
                        shape = RoundedCornerShape(20.dp),
                        color = if (isNeedMode) UrgentRed else Color.Transparent
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = "I need help",
                                fontWeight = FontWeight.Bold,
                                color = if (isNeedMode) Color.White else Slate500,
                                fontSize = 14.sp
                            )
                        }
                    }

                    Surface(
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp)
                            .clickable { isNeedMode = false },
                        shape = RoundedCornerShape(20.dp),
                        color = if (!isNeedMode) SuccessGreen else Color.Transparent
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = "I can give help",
                                fontWeight = FontWeight.Bold,
                                color = if (!isNeedMode) Color.White else Slate500,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // What is short? Tap all that apply
            Text(
                text = if (isNeedMode) "What is short? Tap all that apply" else "What can you offer? Tap all that apply",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )

            Spacer(modifier = Modifier.height(10.dp))

            // 3-column Grid of Categories
            val chunked = NEED_CATEGORIES.chunked(3)
            for (row in chunked) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    for (cat in row) {
                        val isSelected = selectedCats.contains(cat.id)
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .height(82.dp)
                                .clickable {
                                    if (isSelected && selectedCats.size > 1) {
                                        selectedCats.remove(cat.id)
                                    } else if (!isSelected) {
                                        selectedCats.add(cat.id)
                                    }
                                },
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isSelected) {
                                    if (isNeedMode) UrgentRedBg else SuccessGreenBg
                                } else Color.White
                            ),
                            border = androidx.compose.foundation.BorderStroke(
                                if (isSelected) 2.dp else 1.dp,
                                if (isSelected) {
                                    if (isNeedMode) UrgentRed else SuccessGreen
                                } else Slate300
                            )
                        ) {
                            Box(modifier = Modifier.fillMaxSize().padding(6.dp)) {
                                if (isSelected) {
                                    Surface(
                                        modifier = Modifier.size(16.dp).align(Alignment.TopEnd),
                                        shape = CircleShape,
                                        color = if (isNeedMode) UrgentRed else SuccessGreen
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Check,
                                            contentDescription = null,
                                            tint = Color.White,
                                            modifier = Modifier.padding(2.dp)
                                        )
                                    }
                                }
                                Column(
                                    modifier = Modifier.fillMaxSize(),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.Center
                                ) {
                                    Text(text = cat.icon, fontSize = 20.sp)
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = cat.label,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Slate900,
                                        textAlign = TextAlign.Center
                                    )
                                }
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            Spacer(modifier = Modifier.height(10.dp))

            // People Affected Counter
            Text(
                text = if (isNeedMode) "People affected" else "People capacity / units",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
            Spacer(modifier = Modifier.height(6.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate300)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { if (peopleCount > 1) peopleCount-- }
                    ) {
                        Surface(shape = CircleShape, color = Slate100, modifier = Modifier.size(36.dp)) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("−", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Slate900)
                            }
                        }
                    }

                    Text(text = "$peopleCount", fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = Slate900)

                    IconButton(
                        onClick = { peopleCount++ }
                    ) {
                        Surface(shape = CircleShape, color = Slate100, modifier = Modifier.size(36.dp)) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("+", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Slate900)
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Urgency Selector
            Text(
                text = "Urgency",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("Critical", "Urgent", "Can wait").forEach { lvl ->
                    val isSelected = urgency == lvl
                    val btnBg = when {
                        isSelected && lvl == "Critical" -> UrgentRed
                        isSelected && lvl == "Urgent" -> Slate900
                        isSelected && lvl == "Can wait" -> SuccessGreen
                        lvl == "Critical" -> UrgentRedBg
                        lvl == "Can wait" -> SuccessGreenBg
                        else -> Slate100
                    }
                    val textColor = when {
                        isSelected -> Color.White
                        lvl == "Critical" -> UrgentRed
                        lvl == "Can wait" -> SuccessGreen
                        else -> Slate700
                    }

                    Surface(
                        modifier = Modifier
                            .weight(1f)
                            .height(42.dp)
                            .clickable { urgency = lvl },
                        shape = RoundedCornerShape(10.dp),
                        color = btnBg,
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Color.Transparent else Slate300)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(text = lvl, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = textColor)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Live Photo & Voice Note Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = onOpenLiveCamera,
                    modifier = Modifier.weight(1f).height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = if (hasPhoto) SuccessGreenBg else Color.White
                    ),
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, if (hasPhoto) SuccessGreen else Slate900)
                ) {
                    Icon(imageVector = Icons.Default.CameraAlt, contentDescription = null, tint = Slate900)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = if (hasPhoto) "Photo Done" else "Live photo", color = Slate900, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }

                OutlinedButton(
                    onClick = { voiceAttached = !voiceAttached },
                    modifier = Modifier.weight(1f).height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = if (voiceAttached) SuccessGreenBg else Color.White
                    ),
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, if (voiceAttached) SuccessGreen else Slate900)
                ) {
                    Icon(imageVector = Icons.Default.Mic, contentDescription = null, tint = Slate900)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = if (voiceAttached) "Voice Done" else "Voice note", color = Slate900, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
            Text(
                text = "Voice is turned into text for responders. Text only is fine too.",
                fontSize = 11.sp,
                color = Slate500,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(top = 4.dp)
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Location Pinned by GPS Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate300)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.LocationOn, contentDescription = null, tint = SuccessGreen)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(text = "Pinned by GPS: $ward", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Slate900)
                            Text(text = "Exact spot is shown only to verified responders", fontSize = 11.sp, color = Slate500)
                        }
                    }

                    Text(
                        text = "Move",
                        color = SuccessGreen,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        modifier = Modifier.clickable {
                            ward = if (ward == "Ward 4") "Ward 3" else (if (ward == "Ward 3") "Ward 5" else "Ward 4")
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Submit Button: Red "Send need" vs Green "Send offer"
            Button(
                onClick = {
                    viewModel.submitReport(
                        emergencyType = selectedCats.firstOrNull() ?: "Insulin",
                        urgency = urgency,
                        latitude = 30.5564,
                        longitude = 79.5662,
                        locationName = "Pinned by GPS: $ward",
                        description = "${selectedCats.joinToString()} for $peopleCount people in $ward.",
                        onComplete = { onSubmitted() }
                    )
                },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isNeedMode) UrgentRed else SuccessGreen
                )
            ) {
                Text(
                    text = if (isNeedMode) "Send need" else "Send offer",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Every report is checked before it is marked verified. Repeated false reports can get a device blocked.",
                fontSize = 11.sp,
                color = Slate500,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}
