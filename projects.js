// Edit this file to change the projects shown on workspace 2.
// c = color class (rd pe ye gr te bl ma pk), s = tags, t = readme text, link = optional repo URL.
export const projects = [
  { n:"hands-free-cursor", c:"pe", repo:"hands-free-cursor", d:"eye and muscle signals move the cursor",
    t:"A NatHacks 2025 team prototype for people with a motor disability. Webcam eye tracking moves the cursor, and muscle signals read with a BioAmp EXG Pill become clicks, filtered and translated on an Arduino.",
    s:["python","c/c++","arduino","bioamp exg"], link:"https://github.com/arronroasa/gaze-nathacks2025" },
  { n:"homelab", c:"gr", repo:"homelab", d:"self-hosted services on Linux",
    t:"A home Linux server running Immich and Pi-hole in Docker containers, with storage, container settings and networking configured and kept running.",
    s:["linux","docker","immich","pi-hole"] },
  { n:"linux-monitor", c:"bl", repo:"linux-monitor", d:"C++ system monitor for Prometheus",
    t:"A modular monitor that collects host, container and network metrics by parsing /proc and /sys and serves them over HTTP for Prometheus. It has a scheduler, collectors and a metric registry, ships in Docker, runs as a systemd service or a TUI, and is built and tested with GitHub Actions.",
    s:["c++","linux","docker","prometheus","github actions"] },
  { n:"custom-shell", c:"pk", repo:"custom-shell", d:"Unix shell written in C",
    t:"A shell built from scratch: command parsing, cd and pwd, external programs through fork, execve and waitpid, background jobs with job control and signals, plus pipes and I/O redirection.",
    s:["c","system calls","processes"] },
  { n:"dotfiles", c:"ma", repo:"dotfiles", d:"my Hyprland and Neovim setup",
    t:"The config for my Linux desktop on CachyOS: Hyprland with the Noctalia shell, plus Neovim, Alacritty, Kitty, fastfetch and waypaper. Copy the folders into ~/.config to use them. My desktop was my inspiration for this site.",
    s:["hyprland","lua","neovim","cachyos"], link:"https://github.com/linsonis/dotfiles" }
];
