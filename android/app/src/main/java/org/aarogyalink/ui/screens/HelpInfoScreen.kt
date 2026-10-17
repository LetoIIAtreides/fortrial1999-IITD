package org.aarogyalink.ui.screens

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material.icons.filled.PhoneInTalk
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.aarogyalink.R
import org.aarogyalink.ui.theme.BlueLight
import org.aarogyalink.ui.theme.BluePrimary
import org.aarogyalink.ui.theme.Slate500
import org.aarogyalink.ui.theme.Slate700
import org.aarogyalink.ui.theme.Slate900
import org.aarogyalink.ui.theme.SuccessGreen
import org.aarogyalink.ui.theme.SuccessGreenBg
import org.aarogyalink.ui.theme.UrgentRed
import org.aarogyalink.ui.theme.UrgentRedBg
import org.aarogyalink.ui.theme.WarningAmber
import org.aarogyalink.ui.theme.WarningAmberBg

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HelpInfoScreen(
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = stringResource(R.string.help_information), fontWeight = FontWeight.Bold) },
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
                .verticalScroll(scrollState)
        ) {
            // Critical Reminder
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = UrgentRedBg)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.Warning, contentDescription = null, tint = UrgentRed, modifier = Modifier.size(22.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = "Official Emergency Disclaimer", fontWeight = FontWeight.Bold, color = UrgentRed, fontSize = 15.sp)
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "If you have a working phone signal and need urgent help, call 112 first. This application assists community reporting and response coordination but does not substitute the government 112 emergency dispatch system.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate900
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Direct Emergency Helplines
            Text(
                text = "Emergency Telephone Helplines",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )

            Spacer(modifier = Modifier.height(10.dp))

            HelplineRow("112", "National Emergency Unified Services", "All Emergency Services") {
                context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:112")))
            }

            Spacer(modifier = Modifier.height(8.dp))

            HelplineRow("108", "Disaster Medical & Emergency Ambulance", "Toll-Free 24x7") {
                context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:108")))
            }

            Spacer(modifier = Modifier.height(8.dp))

            HelplineRow("102", "Maternal & Child Health Free Ambulance", "Pregnancy Dispatch") {
                context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:102")))
            }

            Spacer(modifier = Modifier.height(8.dp))

            HelplineRow("1070", "State Disaster Management Authority (SDMA)", "Flood & Landslide Helpline") {
                context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:1070")))
            }

            Spacer(modifier = Modifier.height(24.dp))

            // First Aid Guidance
            Text(
                text = "Emergency First Aid Quick Guidelines",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )

            Spacer(modifier = Modifier.height(10.dp))

            FirstAidCard(
                category = "Severe Bleeding",
                guidance = "Apply continuous firm pressure on the wound with a clean cloth or bandage. Elevate the wounded limb above heart level. Do not remove soaked cloth; add more layers on top."
            )

            Spacer(modifier = Modifier.height(10.dp))

            FirstAidCard(
                category = "Pregnancy in Cut-off Area",
                guidance = "Keep expectant mother calm, warm, and resting on her left side. Prepare clean boiled water, sterilized cotton, and warm towels. Keep local PHC or 108 contact ready."
            )

            Spacer(modifier = Modifier.height(10.dp))

            FirstAidCard(
                category = "Fracture / Traumatic Injury",
                guidance = "Do not move or straighten deformed limbs. Splint the limb using rigid cardboard, rolled blanket, or bamboo stick tied securely above and below the injury. Apply ice or cold water."
            )

            Spacer(modifier = Modifier.height(10.dp))

            FirstAidCard(
                category = "Diabetic Emergency",
                guidance = "If patient is conscious and trembling or sweating, administer sugar water, fruit juice, or candy immediately. If unconscious, place in recovery position on side; DO NOT pour fluids in mouth."
            )

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun HelplineRow(number: String, title: String, subtitle: String, onDial: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onDial),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                Surface(
                    modifier = Modifier.size(42.dp),
                    shape = RoundedCornerShape(10.dp),
                    color = BlueLight
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(imageVector = Icons.Default.PhoneInTalk, contentDescription = null, tint = BluePrimary, modifier = Modifier.size(20.dp))
                    }
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(text = title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurface)
                    Text(text = subtitle, fontSize = 12.sp, color = Slate500)
                }
            }

            Surface(shape = RoundedCornerShape(8.dp), color = BluePrimary) {
                Row(modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Default.Call, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = number, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }
        }
    }
}

@Composable
fun FirstAidCard(category: String, guidance: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(imageVector = Icons.Default.MedicalServices, contentDescription = null, tint = BluePrimary, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = category, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = BluePrimary)
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(text = guidance, style = MaterialTheme.typography.bodyMedium, color = Slate700)
        }
    }
}
