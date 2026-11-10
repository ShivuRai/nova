using System;
using System.IO;
using System.Diagnostics;
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
                string candidate4 = @"C:\Users\shivu\.gemini\antigravity\scratch\nova\dist-app\NOVA.exe";

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
                else if (File.Exists(candidate4))
                {
                    targetExe = Path.GetFullPath(candidate4);
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

                // 2. Clear environment variables in current process
                try {
                    Environment.SetEnvironmentVariable("ELECTRON_RUN_AS_NODE", null, EnvironmentVariableTarget.Process);
                    Environment.SetEnvironmentVariable("ELECTRON_RUN_AS_NODE", null, EnvironmentVariableTarget.User);
                } catch {}

                // 3. Start NOVA directly via Windows Shell
                var startInfo = new ProcessStartInfo
                {
                    FileName = targetExe,
                    WorkingDirectory = workingDir,
                    UseShellExecute = true,
                };

                if (args != null && args.Length > 0)
                {
                    startInfo.Arguments = string.Join(" ", args);
                }

                Process.Start(startInfo);
            }
            catch (Exception ex)
            {
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
