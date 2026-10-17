package org.aarogyalink.ui.navigation

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object ReportEmergency : Screen("report_emergency")
    object MyReports : Screen("my_reports")
    object EmergencyMap : Screen("emergency_map")
    object HealthcareFacilities : Screen("healthcare_facilities")
    object HelpInfo : Screen("help_info")
}
