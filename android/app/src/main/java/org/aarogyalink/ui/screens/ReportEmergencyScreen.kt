package org.aarogyalink.ui.screens

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.GpsFixed
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import org.aarogyalink.R
import org.aarogyalink.ui.theme.BlueLight
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

val EMERGENCY_CATEGORIES = listOf(
    "Pregnancy" to R.string.cat_pregnancy,
    "Diabetes" to R.string.cat_diabetes,
    "Bleeding" to R.string.cat_bleeding,
    "Fever" to R.string.cat_fever,
    "Injury" to R.string.cat_injury,
    "Medicine needed" to R.string.cat_medicine
)

val URGENCY_OPTIONS = listOf(
    "High" to R.string.urgency_high,
    "Medium" to R.string.urgency_medium,
    "Low" to R.string.urgency_low
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportEmergencyScreen(
    viewModel: ReportViewModel,
    onNavigateBack: () -> Unit,
    onReportSubmitted: () -> Unit
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    val selectedCategory by viewModel.selectedCategory.collectAsState()
    val selectedUrgency by viewModel.selectedUrgency.collectAsState()
    val latitude by viewModel.latitude.collectAsState()
    val longitude by viewModel.longitude.collectAsState()
    val locationName by viewModel.locationName.collectAsState()
    val description by viewModel.description.collectAsState()
    val isSubmitting by viewModel.isSubmitting.collectAsState()
    val submissionMessage by viewModel.submissionMessage.collectAsState()
    val isError by viewModel.isError.collectAsState()

    var isReviewStep by remember { mutableStateOf(false) }

    // Location Permission Launcher
    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            fetchGpsLocation(context) { lat, lng ->
                viewModel.setLocation(lat, lng, "GPS Coordinates Captured")
                Toast.makeText(context, "Location coordinates obtained: $lat, $lng", Toast.LENGTH_SHORT).show()
            }
        } else {
            Toast.makeText(context, "Location permission not granted. You can enter location manually.", Toast.LENGTH_LONG).show()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = if (isReviewStep) stringResource(R.string.review_report) else stringResource(R.string.report_emergency),
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = {
                        if (isReviewStep) isReviewStep = false else onNavigateBack()
                    }) {
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
                .verticalScroll(scrollState)
        ) {
            if (!isReviewStep) {
                // Question Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "What kind of help do you need?",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        Text(
                            text = "Select an emergency category below",
                            style = MaterialTheme.typography.bodySmall,
                            color = Slate500
                        )
                    }
                    IconButton(onClick = {
                        viewModel.speak("What kind of help do you need? Pregnancy, Diabetes, Bleeding, Fever, Injury, or Medicine needed.")
                    }) {
                        Icon(imageVector = Icons.Default.VolumeUp, contentDescription = "Listen", tint = BluePrimary)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // 2-Column Grid of Large Category Tiles
                val categoryPairs = EMERGENCY_CATEGORIES.chunked(2)
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    categoryPairs.forEach { rowPairs ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            rowPairs.forEach { (catKey, strRes) ->
                                val isSelected = selectedCategory == catKey
                                val iconText = when (catKey) {
                                    "Pregnancy" -> "🤰"
                                    "Bleeding" -> "🩸"
                                    "Diabetes" -> "🩺"
                                    "Fever" -> "🌡️"
                                    "Injury" -> "🩹"
                                    else -> "💊"
                                }

                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(96.dp)
                                        .clickable {
                                            viewModel.selectedCategory.value = catKey
                                            viewModel.speak(catKey)
                                        },
                                    shape = RoundedCornerShape(16.dp),
                                    color = if (isSelected) BlueLight else MaterialTheme.colorScheme.surface,
                                    border = androidx.compose.foundation.BorderStroke(
                                        width = if (isSelected) 2.dp else 1.dp,
                                        color = if (isSelected) BluePrimary else Slate300
                                    ),
                                    shadowElevation = if (isSelected) 4.dp else 1.dp
                                ) {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .padding(10.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.Center
                                    ) {
                                        Text(text = iconText, fontSize = 28.sp)
                                        Spacer(modifier = Modifier.height(6.dp))
                                        Text(
                                            text = stringResource(strRes),
                                            style = MaterialTheme.typography.bodyMedium,
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.SemiBold,
                                            color = if (isSelected) BluePrimary else MaterialTheme.colorScheme.onSurface,
                                            maxLines = 1
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // STEP 2: Urgency Level
                Text(
                    text = stringResource(R.string.step_urgency),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = stringResource(R.string.urgency_disclaimer),
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate500,
                    modifier = Modifier.padding(top = 2.dp, bottom = 8.dp)
                )

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    URGENCY_OPTIONS.forEach { (levelKey, strRes) ->
                        val isSelected = selectedUrgency == levelKey
                        val bgColor = when (levelKey) {
                            "High" -> if (isSelected) UrgentRed else UrgentRedBg
                            "Medium" -> if (isSelected) WarningAmber else WarningAmberBg
                            else -> if (isSelected) SuccessGreen else SuccessGreenBg
                        }
                        val textColor = when (levelKey) {
                            "High" -> if (isSelected) Color.White else UrgentRed
                            "Medium" -> if (isSelected) Color.White else WarningAmber
                            else -> if (isSelected) Color.White else SuccessGreen
                        }

                        Surface(
                            modifier = Modifier
                                .weight(1f)
                                .height(56.dp)
                                .clickable { viewModel.selectedUrgency.value = levelKey },
                            shape = RoundedCornerShape(12.dp),
                            color = bgColor
                        ) {
                            Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(4.dp)) {
                                Text(
                                    text = stringResource(strRes).split("—")[0].trim(),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = textColor
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // STEP 3: Location Details
                Text(
                    text = stringResource(R.string.step_location),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )

                Spacer(modifier = Modifier.height(8.dp))

                Button(
                    onClick = {
                        val check = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION)
                        if (check == PackageManager.PERMISSION_GRANTED) {
                            fetchGpsLocation(context) { lat, lng ->
                                viewModel.setLocation(lat, lng, "Current GPS Coordinates")
                                Toast.makeText(context, "Location recorded: $lat, $lng", Toast.LENGTH_SHORT).show()
                            }
                        } else {
                            locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = BlueLight)
                ) {
                    Icon(imageVector = Icons.Default.GpsFixed, contentDescription = null, tint = BluePrimary)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (latitude != null) "GPS: ${latitude?.format(3)}, ${longitude?.format(3)}" else stringResource(R.string.use_gps_location),
                        color = BluePrimary,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = locationName,
                    onValueChange = { viewModel.locationName.value = it },
                    placeholder = { Text(stringResource(R.string.location_placeholder)) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(20.dp))

                // STEP 4: Description (Optional)
                Text(
                    text = stringResource(R.string.step_description),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = description,
                    onValueChange = { viewModel.description.value = it },
                    placeholder = { Text(stringResource(R.string.desc_placeholder)) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(110.dp),
                    shape = RoundedCornerShape(10.dp),
                    maxLines = 4
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Continue to Review Button
                Button(
                    onClick = {
                        if (selectedCategory.isBlank()) {
                            Toast.makeText(context, "Please select an emergency category first.", Toast.LENGTH_SHORT).show()
                        } else {
                            isReviewStep = true
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = BluePrimary)
                ) {
                    Text(text = "Proceed to Review", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            } else {
                // REVIEW SCREEN BEFORE SUBMISSION
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Text(
                            text = "Report Summary",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = BluePrimary
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        ReviewItem(label = "Emergency Category", value = selectedCategory)
                        ReviewItem(label = "Reported Urgency", value = "$selectedUrgency Urgency")
                        ReviewItem(
                            label = "Location",
                            value = locationName.ifBlank {
                                if (latitude != null) "Coordinates (${latitude?.format(4)}, ${longitude?.format(4)})" else "Not provided"
                            }
                        )
                        ReviewItem(
                            label = "Medical Notes / Description",
                            value = description.ifBlank { "No additional notes entered." }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Clear Warning: Local persistence is not server delivery
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = WarningAmberBg)
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(imageVector = Icons.Default.Info, contentDescription = null, tint = WarningAmber)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = stringResource(R.string.delivery_warning),
                            style = MaterialTheme.typography.bodySmall,
                            color = Slate900,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                if (submissionMessage != null) {
                    Spacer(modifier = Modifier.height(14.dp))
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        color = if (isError) UrgentRedBg else SuccessGreenBg
                    ) {
                        Text(
                            text = submissionMessage!!,
                            color = if (isError) UrgentRed else SuccessGreen,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(12.dp),
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Submit Button
                Button(
                    onClick = {
                        viewModel.submitReport { success ->
                            onReportSubmitted()
                        }
                    },
                    enabled = !isSubmitting,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = UrgentRed)
                ) {
                    if (isSubmitting) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                    } else {
                        Text(
                            text = stringResource(R.string.submit_report),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun ReviewItem(label: String, value: String) {
    Column(modifier = Modifier.padding(vertical = 6.dp)) {
        Text(text = label, style = MaterialTheme.typography.bodySmall, color = Slate500, fontWeight = FontWeight.SemiBold)
        Text(text = value, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Medium)
    }
}

private fun fetchGpsLocation(context: Context, onLocation: (Double, Double) -> Unit) {
    val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return
    try {
        val providers = listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER, LocationManager.PASSIVE_PROVIDER)
        for (provider in providers) {
            val loc: Location? = locationManager.getLastKnownLocation(provider)
            if (loc != null) {
                onLocation(loc.latitude, loc.longitude)
                return
            }
        }
    } catch (_: SecurityException) {
    }
}

private fun Double.format(digits: Int) = String.format(java.util.Locale.US, "%.${digits}f", this)
