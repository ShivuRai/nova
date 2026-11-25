use serde::Serialize;
use std::sync::Mutex;
use sysinfo::{Disks, Networks, System};

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SystemMetrics {
    pub cpu_usage_percent: u32,
    pub ram_usage_percent: u32,
    pub ram_used_gb: f32,
    pub ram_total_gb: f32,
    pub disk_usage_percent: u32,
    pub disk_free_gb: u64,
    pub network_download_kbps: u64,
    pub network_upload_kbps: u64,
}

pub struct SystemMonitor {
    sys: Mutex<System>,
    disks: Mutex<Disks>,
    networks: Mutex<Networks>,
    last_network_refresh: Mutex<std::time::Instant>,
}

impl SystemMonitor {
    pub fn new() -> Self {
        let mut sys = System::new_all();
        sys.refresh_all();
        let disks = Disks::new_with_refreshed_list();
        let networks = Networks::new_with_refreshed_list();

        SystemMonitor {
            sys: Mutex::new(sys),
            disks: Mutex::new(disks),
            networks: Mutex::new(networks),
            last_network_refresh: Mutex::new(std::time::Instant::now()),
        }
    }

    pub fn get_metrics(&self) -> SystemMetrics {
        let mut sys = self.sys.lock().unwrap();
        sys.refresh_cpu_all();
        sys.refresh_memory();

        let cpu_usage_percent = sys.global_cpu_usage().round() as u32;

        let total_ram_bytes = sys.total_memory();
        let used_ram_bytes = sys.used_memory();
        let ram_total_gb = (total_ram_bytes as f32) / (1024.0 * 1024.0 * 1024.0);
        let ram_used_gb = (used_ram_bytes as f32) / (1024.0 * 1024.0 * 1024.0);
        let ram_usage_percent = if total_ram_bytes > 0 {
            ((used_ram_bytes as f64 / total_ram_bytes as f64) * 100.0) as u32
        } else {
            0
        };

        // Disks
        let mut disks = self.disks.lock().unwrap();
        disks.refresh(true);
        let mut total_disk_space = 0u64;
        let mut available_disk_space = 0u64;
        for disk in disks.iter() {
            total_disk_space += disk.total_space();
            available_disk_space += disk.available_space();
        }
        let disk_free_gb = available_disk_space / (1024 * 1024 * 1024);
        let disk_usage_percent = if total_disk_space > 0 {
            (((total_disk_space - available_disk_space) as f64 / total_disk_space as f64) * 100.0) as u32
        } else {
            0
        };

        // Network
        let mut networks = self.networks.lock().unwrap();
        networks.refresh(true);
        let mut current_rx = 0u64;
        let mut current_tx = 0u64;
        for (_interface, data) in networks.iter() {
            current_rx += data.received();
            current_tx += data.transmitted();
        }

        let mut last_refresh = self.last_network_refresh.lock().unwrap();
        let elapsed = last_refresh.elapsed().as_secs_f64();
        *last_refresh = std::time::Instant::now();
        let seconds = elapsed.max(0.1);
        let network_download_kbps = (current_rx as f64 / 1024.0 / seconds) as u64;
        let network_upload_kbps = (current_tx as f64 / 1024.0 / seconds) as u64;

        SystemMetrics {
            cpu_usage_percent,
            ram_usage_percent,
            ram_used_gb: (ram_used_gb * 10.0).round() / 10.0,
            ram_total_gb: (ram_total_gb * 10.0).round() / 10.0,
            disk_usage_percent,
            disk_free_gb,
            network_download_kbps,
            network_upload_kbps,
        }
    }
}
