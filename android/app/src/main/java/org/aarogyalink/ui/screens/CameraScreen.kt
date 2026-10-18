package org.aarogyalink.ui.screens

import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.aarogyalink.ui.theme.Slate500
import org.aarogyalink.ui.theme.Slate700
import org.aarogyalink.ui.theme.Slate900
import org.aarogyalink.ui.theme.SuccessGreen
import org.aarogyalink.ui.theme.UrgentRed
import org.aarogyalink.ui.theme.WarningAmber

@Composable
fun LiveIncidentCameraScreen(
    onClose: () -> Unit,
    onPhotoCaptured: () -> Unit,
    onSendTextOnly: () -> Unit
) {
    var flashActive by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF090D16))
    ) {
        // Top Header: Close [X], LIVE CAMERA, Flash
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onClose,
                modifier = Modifier.size(38.dp)
            ) {
                Surface(
                    shape = CircleShape,
                    color = Color(0xFF1E293B),
                    modifier = Modifier.size(38.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                    }
                }
            }

            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color(0xFF1E293B),
                modifier = Modifier.padding(horizontal = 4.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(modifier = Modifier.size(8.dp).background(UrgentRed, shape = CircleShape))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "LIVE CAMERA", fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
                }
            }

            IconButton(
                onClick = { flashActive = !flashActive },
                modifier = Modifier.size(38.dp)
            ) {
                Surface(
                    shape = CircleShape,
                    color = if (flashActive) WarningAmber else Color(0xFF1E293B),
                    modifier = Modifier.size(38.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.FlashOn,
                            contentDescription = "Flash",
                            tint = if (flashActive) Slate900 else Color.White
                        )
                    }
                }
            }
        }

        // GPS Locked Card
        Surface(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            shape = RoundedCornerShape(14.dp),
            color = Color(0xCC0F172A)
        ) {
            Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(imageVector = Icons.Default.LocationOn, contentDescription = null, tint = SuccessGreen)
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(text = "GPS locked · within 8 m", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text(text = "10.52 N, 76.21 E (example)", color = Slate500, fontSize = 11.sp)
                    Text(text = "18 Oct 2026 · 09:14 · Ward 4", color = Color.White.copy(alpha = 0.8f), fontSize = 11.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Viewfinder Canvas with Waterline Overlay
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .background(Color(0xFF334155), shape = RoundedCornerShape(16.dp)),
            contentAlignment = Alignment.Center
        ) {
            // Draw Dashed Estimated Waterline
            Canvas(modifier = Modifier.fillMaxSize()) {
                val canvasWidth = size.width
                val canvasHeight = size.height
                val waterlineY = canvasHeight * 0.58f

                drawLine(
                    color = Color.White,
                    start = Offset(0f, waterlineY),
                    end = Offset(canvasWidth, waterlineY),
                    strokeWidth = 3f,
                    pathEffect = PathEffect.dashPathEffect(floatArrayOf(15f, 15f), 0f)
                )
            }

            // Water depth badge & house mockup
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = WarningAmber
                ) {
                    Text(
                        text = "Water depth ~1.2 m (low confidence)",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = Slate900,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                Box(
                    modifier = Modifier
                        .size(140.dp)
                        .border(androidx.compose.foundation.BorderStroke(2.dp, WarningAmber), shape = RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "🏠", fontSize = 48.sp)
                }
            }

            // Tip Box
            Surface(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(14.dp),
                shape = RoundedCornerShape(10.dp),
                color = Color(0xDD0F172A)
            ) {
                Text(
                    text = "Tip: keep a door, pole or person in frame. It gives scale for the depth estimate.",
                    color = Color.White,
                    fontSize = 11.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(10.dp)
                )
            }
        }

        // Bottom Camera Controls
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Tabs: Photo, Video, Area sweep
            Row(
                horizontalArrangement = Arrangement.spacedBy(28.dp),
                modifier = Modifier.padding(bottom = 14.dp)
            ) {
                Text(text = "Photo", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text(text = "Video", color = Slate700, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text(text = "Area sweep", color = Slate700, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }

            // Shutter Button Row
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Send text only",
                    color = Slate500,
                    fontSize = 13.sp,
                    textDecoration = TextDecoration.Underline,
                    modifier = Modifier.clickable { onSendTextOnly() }
                )

                // Big White Circular Shutter
                Surface(
                    modifier = Modifier
                        .size(68.dp)
                        .clickable { onPhotoCaptured() },
                    shape = CircleShape,
                    color = Color.Transparent,
                    border = androidx.compose.foundation.BorderStroke(4.dp, Color.White)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Surface(
                            modifier = Modifier.size(54.dp),
                            shape = CircleShape,
                            color = Color.White
                        ) {}
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(8.dp).background(SuccessGreen, shape = CircleShape))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "Online", color = SuccessGreen, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Camera only. Gallery photos are not accepted, so old pictures cannot be reused.\nAI estimates depth and area from the photo and nearby reports. A responder confirms.",
                color = Slate500,
                fontSize = 10.sp,
                textAlign = TextAlign.Center,
                lineHeight = 14.sp
            )
        }
    }
}
