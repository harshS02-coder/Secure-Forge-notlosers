package com.nexusai.security.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavDestination
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.*
import com.nexusai.security.R
import com.nexusai.security.ui.home.HomeScreen
import com.nexusai.security.ui.scan.ScanScreen
import com.nexusai.security.ui.reports.ReportsScreen
import com.nexusai.security.ui.settings.SettingsScreen
import com.nexusai.security.ui.theme.NexusAITheme
import com.nexusai.security.ui.theme.NexusColors
import com.nexusai.security.ui.theme.EyebrowStyle
import dagger.hilt.android.AndroidEntryPoint
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Security
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Settings

sealed class Screen(
    val route: String,
    val labelResId: Int,
    val selectedIcon: @Composable () -> Unit,
    val unselectedIcon: @Composable () -> Unit
) {
    object Home : Screen(
        "home", R.string.nav_home,
        { Icon(Icons.Filled.Home, null) },
        { Icon(Icons.Outlined.Home, null) }
    )
    object Scan : Screen(
        "scan", R.string.nav_scan,
        { Icon(Icons.Filled.Security, null) },
        { Icon(Icons.Outlined.Security, null) }
    )
    object Reports : Screen(
        "reports", R.string.nav_reports,
        { Icon(Icons.Filled.Description, null) },
        { Icon(Icons.Outlined.Description, null) }
    )
    object Settings : Screen(
        "settings", R.string.nav_settings,
        { Icon(Icons.Filled.Settings, null) },
        { Icon(Icons.Outlined.Settings, null) }
    )
}

val bottomNavItems = listOf(Screen.Home, Screen.Scan, Screen.Reports, Screen.Settings)

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NexusAITheme {
                val navController = rememberNavController()
                Scaffold(
                    bottomBar = { BottomNavBar(navController) },
                    containerColor = NexusColors.SurfaceSecondary
                ) { paddingValues ->
                    NavHost(
                        navController = navController,
                        startDestination = Screen.Home.route,
                        modifier = Modifier.padding(paddingValues)
                    ) {
                        composable(Screen.Home.route) { HomeScreen() }
                        composable(Screen.Scan.route) { ScanScreen() }
                        composable(Screen.Reports.route) { ReportsScreen(navController) }
                        composable(Screen.Settings.route) { SettingsScreen() }
                        composable("report/{scanId}") { backStackEntry ->
                            val scanId = backStackEntry.arguments?.getString("scanId")?.toLongOrNull() ?: 0L
                            com.nexusai.security.ui.reports.ReportDetailScreen(scanId, navController)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun BottomNavBar(navController: NavHostController) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    NavigationBar(
        containerColor = NexusColors.Surface,
        contentColor = NexusColors.OnSurface,
        tonalElevation = 0.dp
    ) {
        bottomNavItems.forEach { screen ->
            val selected = currentDestination?.hierarchy?.any { destination: NavDestination -> destination.route == screen.route } == true
            NavigationBarItem(
                icon = { if (selected) screen.selectedIcon() else screen.unselectedIcon() },
                label = {
                    Text(
                        stringResource(screen.labelResId),
                        style = EyebrowStyle.copy(fontSize = 9.sp)
                    )
                },
                selected = selected,
                onClick = {
                    navController.navigate(screen.route) {
                        popUpTo(navController.graph.findStartDestination().id) {
                            saveState = true
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = NexusColors.Primary,
                    selectedTextColor = NexusColors.Primary,
                    unselectedIconColor = NexusColors.OnSurfaceMuted,
                    unselectedTextColor = NexusColors.OnSurfaceMuted,
                    indicatorColor = Color.Transparent
                )
            )
        }
    }
}
