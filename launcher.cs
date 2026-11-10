using System;
using System.IO;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows.Forms;

[assembly: System.Reflection.AssemblyTitle("NOVA Desktop Companion")]
[assembly: System.Reflection.AssemblyDescription("NOVA - Your desktop. Reimagined. Dynamic Island overlay for Windows.")]
[assembly: System.Reflection.AssemblyConfiguration("")]
[assembly: System.Reflection.AssemblyCompany("NOVA Open Source Project")]
[assembly: System.Reflection.AssemblyProduct("NOVA")]
[assembly: System.Reflection.AssemblyCopyright("Copyright (c) 2026 NOVA Open Source Project. All rights reserved.")]
[assembly: System.Reflection.AssemblyTrademark("NOVA")]
[assembly: System.Reflection.AssemblyCulture("")]
[assembly: System.Reflection.AssemblyVersion("1.0.0.0")]
[assembly: System.Reflection.AssemblyFileVersion("1.0.0.0")]

namespace NovaLauncher
{
    static class Program
    {
        [DllImport("user32.dll")]
        private static extern bool SetForegroundWindow(IntPtr hWnd);

        [DllImport("user32.dll")]
        private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        private const int SW_RESTORE = 9;

        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                // 1. Resolve path to dist-app\NOVA.exe
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string candidate1 = Path.Combine(baseDir, "dist-app", "NOVA.exe");
                string candidate2 = Path.Combine(baseDir, "..", "dist-app", "NOVA.exe");
                string userProfile = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
                string candidate3 = Path.Combine(userProfile, @".gemini\antigravity\scratch\nova\dist-app\NOVA.exe");

                string targetExe = null;
                if (File.Exists(candidate1))
                {
                    targetExe = Path.GetFullPath(candidate1);
                }
                else if (File.Exists(candidate2))
                {
                    targetExe = Path.GetFullPath(candidate2);
                }
                else if (File.Exists(candidate3))
                {
                    targetExe = Path.GetFullPath(candidate3);
                }

                if (string.IsNullOrEmpty(targetExe) || !File.Exists(targetExe))
                {
                    MessageBox.Show(
                        "Unable to find the NOVA application core (dist-app\\NOVA.exe).\nPlease ensure NOVA is properly installed.",
                        "NOVA - Launch Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }

                string workingDir = Path.GetDirectoryName(targetExe);

                // 2. Clear any environment variable that might force Electron into node-only mode
                Environment.SetEnvironmentVariable("ELECTRON_RUN_AS_NODE", null, EnvironmentVariableTarget.Process);
                Environment.SetEnvironmentVariable("ELECTRON_RUN_AS_NODE", null, EnvironmentVariableTarget.User);

                // 3. Start NOVA completely detached using Windows Shell
                var startInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = string.Format("/c \"set ELECTRON_RUN_AS_NODE=&& start \"\" \"\"{0}\"\" {1}\"", targetExe, args != null && args.Length > 0 ? string.Join(" ", args) : ""),
                    WorkingDirectory = workingDir,
                    CreateNoWindow = true,
                    WindowStyle = ProcessWindowStyle.Hidden,
                    UseShellExecute = false,
                };

                Process.Start(startInfo);
                File.AppendAllText("launcher.log", "Started successfully!\n");
            }
            catch (Exception ex)
            {
                File.AppendAllText("launcher.log", string.Format("Error: {0}\n", ex));
                MessageBox.Show(
                    "Failed to launch NOVA: " + ex.Message,
                    "NOVA - Launch Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }
    }
}
