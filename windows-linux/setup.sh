#!/bin/bash
echo "============================================"
echo "        ECLIPSE CLIENT - LINUX SETUP"
echo "============================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Install it with: sudo apt install nodejs npm"
    echo "Or download from: https://nodejs.org"
    exit 1
fi

echo "[OK] Node.js found: $(node --version)"
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

# Install dependencies
echo "[INSTALLING] Dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies."
    exit 1
fi
echo ""
echo "[OK] Dependencies installed!"
echo ""

# Build frontend
echo "[BUILDING] Frontend..."
npx vite build
if [ $? -ne 0 ]; then
    echo "[ERROR] Frontend build failed."
    exit 1
fi
echo ""
echo "[OK] Build complete!"
echo ""

# Create launcher script in windows-linux folder
cat > windows-linux/EclipseClient.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/.."
npx electron .
EOF
chmod +x windows-linux/EclipseClient.sh

echo "============================================"
echo "  BUILD COMPLETE! Run EclipseClient.sh in"
echo "  the windows-linux folder to launch."
echo "============================================"
