#!/usr/bin/env bash
set -e

WORKSPACE_DIR="/workspace"
PARTITIONS_DIR="/partitions"

function show_help() {
    echo "=================================================="
    echo "          AgentOS - AI Isolated Environment       "
    echo "=================================================="
    echo "Usage: agentos <command> [arguments]"
    echo ""
    echo "Commands:"
    echo "  info                    Display AgentOS status, memory & isolation verification"
    echo "  list                    List all application partitions"
    echo "  new <name>              Create a new application partition (workspace + git + venv)"
    echo "  delete <name>           Remove an application partition"
    echo "  install-cli <tool>      Helper to install common tools (aws, supabase, stripe)"
    echo "  help                    Show this help message"
    echo "=================================================="
}

function show_info() {
    echo "=== AgentOS Status ==="
    echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d '\"')"
    echo "Kernel: $(uname -r)"
    echo "User: $(whoami) (UID: $(id -u))"
    echo "Python: $(python3 --version 2>/dev/null || echo 'Not installed')"
    echo "Node.js: $(node -v 2>/dev/null || echo 'Not installed')"
    echo "Git: $(git --version 2>/dev/null || echo 'Not installed')"
    echo "GitHub CLI: $(gh --version 2>/dev/null | head -n1 || echo 'Not installed')"
    echo ""
    echo "=== Host Isolation Status ==="
    if mount | grep -q "/mnt/c "; then
        echo "WARNING: Host C: drive is mounted!"
    else
        echo "SECURE: Host C: drive is UNMOUNTED. Windows host files are isolated."
    fi
    echo "Shared Workspace: /workspace -> Windows host AIOS/workspace"
    echo ""
    echo "=== Memory & Disk ==="
    free -h
    echo ""
    df -h / /workspace
}

function list_partitions() {
    echo "=== Shared Partitions (/workspace/projects) ==="
    mkdir -p "$WORKSPACE_DIR/projects"
    ls -lh "$WORKSPACE_DIR/projects"
    echo ""
    echo "=== Internal Isolated Partitions (/partitions) ==="
    mkdir -p "$PARTITIONS_DIR"
    ls -lh "$PARTITIONS_DIR"
}

function new_partition() {
    local name="$1"
    if [ -z "$name" ]; then
        echo "Error: Partition name is required. Usage: agentos new <name>"
        exit 1
    fi

    local target="$WORKSPACE_DIR/projects/$name"
    if [ -d "$target" ]; then
        echo "Error: Partition '$name' already exists at $target"
        exit 1
    fi

    echo "Creating partition: $name..."
    mkdir -p "$target"
    cd "$target"
    
    # Initialize git repo
    git init -q
    
    # Initialize virtual environment
    python3 -m venv .venv
    
    # Create standard partition structure
    mkdir -p src tests config data
    cat << EOF > config/partition.json
{
  "partition": "$name",
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "owner": "agent",
  "status": "active"
}
EOF

    cat << EOF > .gitignore
.venv/
__pycache__/
*.pyc
node_modules/
.env
data/
EOF

    echo "# Partition: $name" > README.md
    echo "Created inside AgentOS at $(date)" >> README.md
    
    echo "Partition '$name' successfully created at $target!"
    echo "  - Directory: $target"
    echo "  - Python Venv: $target/.venv"
    echo "  - Git initialized"
    echo "  - Synced to Windows host: C:\\Users\\LOL\\Desktop\\AIOS\\workspace\\projects\\$name"
}

function delete_partition() {
    local name="$1"
    if [ -z "$name" ]; then
        echo "Error: Partition name is required. Usage: agentos delete <name>"
        exit 1
    fi

    local target="$WORKSPACE_DIR/projects/$name"
    if [ ! -d "$target" ]; then
        echo "Error: Partition '$name' does not exist."
        exit 1
    fi

    echo "Deleting partition '$name'..."
    rm -rf "$target"
    echo "Partition '$name' deleted."
}

function install_cli() {
    local tool="$1"
    case "$tool" in
        "aws")
            echo "Installing AWS CLI v2..."
            curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip"
            unzip -q /tmp/awscliv2.zip -d /tmp
            sudo /tmp/aws/install --update
            rm -rf /tmp/aws /tmp/awscliv2.zip
            echo "AWS CLI installed: $(aws --version)"
            ;;
        "supabase")
            echo "Installing Supabase CLI..."
            sudo npm install -g supabase
            echo "Supabase CLI installed."
            ;;
        "stripe")
            echo "Installing Stripe CLI..."
            curl -s https://packages.stripe.dev/stripe-cli-debian-local/stripecli.gpg | sudo gpg --dearmor -o /usr/share/keyrings/stripe.gpg
            echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee /etc/apt/sources.list.d/stripe.list
            sudo apt-get update -qq && sudo apt-get install -y stripe
            echo "Stripe CLI installed."
            ;;
        *)
            echo "Unknown tool: $tool"
            echo "Available shortcuts: aws, supabase, stripe"
            echo "You can also install any package directly with: sudo apt install <pkg>, npm install -g <pkg>, or pipx install <pkg>"
            ;;
    esac
}

case "$1" in
    info)
        show_info
        ;;
    list)
        list_partitions
        ;;
    new)
        new_partition "$2"
        ;;
    delete)
        delete_partition "$2"
        ;;
    install-cli)
        install_cli "$2"
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
