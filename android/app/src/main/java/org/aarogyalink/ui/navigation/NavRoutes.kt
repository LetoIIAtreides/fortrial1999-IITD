package org.aarogyalink.ui.navigation

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object ReportEmergency : Screen("report_emergency")
    object MyReports : Screen("my_reports")
    object EmergencyMap : Screen("emergency_map")
    object AddNeedOffer : Screen("add_need_offer")
    object LiveIncidentCamera : Screen("live_incident_camera")
    object RoadsTransport : Screen("roads_transport")
    object HealthcareFacilities : Screen("healthcare_facilities")
    object HelpInfo : Screen("help_info")
    object ResponderConsole : Screen("responder_console")
}
