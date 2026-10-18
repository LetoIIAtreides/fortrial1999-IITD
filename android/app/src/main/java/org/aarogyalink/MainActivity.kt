package org.aarogyalink

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import org.aarogyalink.ui.navigation.Screen
import org.aarogyalink.ui.screens.AddNeedOfferScreen
import org.aarogyalink.ui.screens.EmergencyMapScreen
import org.aarogyalink.ui.screens.FacilitiesScreen
import org.aarogyalink.ui.screens.HelpInfoScreen
import org.aarogyalink.ui.screens.HomeScreen
import org.aarogyalink.ui.screens.LiveIncidentCameraScreen
import org.aarogyalink.ui.screens.MyReportsScreen
import org.aarogyalink.ui.screens.ReportEmergencyScreen
import org.aarogyalink.ui.screens.ResponderConsoleScreen
import org.aarogyalink.ui.screens.RoadsTransportScreen
import org.aarogyalink.ui.theme.AarogyaLinkTheme
import org.aarogyalink.ui.viewmodel.FacilitiesViewModel
import org.aarogyalink.ui.viewmodel.ReportViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AarogyaLinkTheme {
                val navController = rememberNavController()
                val reportViewModel: ReportViewModel = viewModel()
                val facilitiesViewModel: FacilitiesViewModel = viewModel()

                NavHost(
                    navController = navController,
                    startDestination = Screen.Home.route
                ) {
                    composable(Screen.Home.route) {
                        HomeScreen(
                            viewModel = reportViewModel,
                            onNavigate = { route -> navController.navigate(route) }
                        )
                    }

                    composable(Screen.ReportEmergency.route) {
                        ReportEmergencyScreen(
                            viewModel = reportViewModel,
                            onNavigateBack = { navController.popBackStack() },
                            onReportSubmitted = {
                                navController.navigate(Screen.MyReports.route) {
                                    popUpTo(Screen.Home.route)
                                }
                            }
                        )
                    }

                    composable(Screen.MyReports.route) {
                        MyReportsScreen(
                            viewModel = reportViewModel,
                            onNavigateBack = { navController.popBackStack() }
                        )
                    }

                    composable(Screen.HealthcareFacilities.route) {
                        FacilitiesScreen(
                            viewModel = facilitiesViewModel,
                            onNavigateBack = { navController.popBackStack() }
                        )
                    }

                    composable(Screen.EmergencyMap.route) {
                        EmergencyMapScreen(
                            reportViewModel = reportViewModel,
                            facilitiesViewModel = facilitiesViewModel,
                            onNavigateBack = { navController.popBackStack() },
                            onNavigateToRoute = { route -> navController.navigate(route) }
                        )
                    }

                    composable(Screen.AddNeedOffer.route) {
                        AddNeedOfferScreen(
                            viewModel = reportViewModel,
                            onNavigateBack = { navController.popBackStack() },
                            onOpenLiveCamera = { navController.navigate(Screen.LiveIncidentCamera.route) },
                            onSubmitted = {
                                navController.navigate(Screen.MyReports.route) {
                                    popUpTo(Screen.Home.route)
                                }
                            }
                        )
                    }

                    composable(Screen.LiveIncidentCamera.route) {
                        LiveIncidentCameraScreen(
                            onClose = { navController.popBackStack() },
                            onPhotoCaptured = { navController.popBackStack() },
                            onSendTextOnly = { navController.popBackStack() }
                        )
                    }

                    composable(Screen.RoadsTransport.route) {
                        RoadsTransportScreen(
                            onNavigateBack = { navController.popBackStack() },
                            onRequestBoat = {
                                navController.navigate(Screen.AddNeedOffer.route)
                            }
                        )
                    }

                    composable(Screen.ResponderConsole.route) {
                        ResponderConsoleScreen(
                            reportViewModel = reportViewModel,
                            onNavigateBack = { navController.popBackStack() }
                        )
                    }

                    composable(Screen.HelpInfo.route) {
                        HelpInfoScreen(
                            onNavigateBack = { navController.popBackStack() }
                        )
                    }
                }
            }
        }
    }
}
