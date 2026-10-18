package org.medlink

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import org.medlink.ui.navigation.Screen
import org.medlink.ui.screens.AddNeedOfferScreen
import org.medlink.ui.screens.EmergencyMapScreen
import org.medlink.ui.screens.FacilitiesScreen
import org.medlink.ui.screens.HelpInfoScreen
import org.medlink.ui.screens.HomeScreen
import org.medlink.ui.screens.LiveIncidentCameraScreen
import org.medlink.ui.screens.MyReportsScreen
import org.medlink.ui.screens.ReportEmergencyScreen
import org.medlink.ui.screens.ResponderConsoleScreen
import org.medlink.ui.screens.RoadsTransportScreen
import org.medlink.ui.theme.MedLinkTheme
import org.medlink.ui.viewmodel.FacilitiesViewModel
import org.medlink.ui.viewmodel.ReportViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MedLinkTheme {
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
