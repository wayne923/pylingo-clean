import docker
import tempfile
import os
import json
from pathlib import Path
from typing import Dict, Any, Optional

class DockerExecutor:
    def __init__(self):
        try:
            self.client = docker.from_env()
            # Test if Docker is available
            self.client.ping()
            self.available = True
        except Exception as e:
            print(f"Docker not available: {e}")
            self.available = False
    
    def is_available(self) -> bool:
        return self.available
    
    def execute_python_code(
        self, 
        code: str, 
        timeout: int = 30,
        requirements: Optional[list] = None
    ) -> Dict[str, Any]:
        """Execute Python code in a Docker container"""
        
        if not self.available:
            return {
                "success": False,
                "output": "",
                "error": "Docker is not available on this system"
            }
        
        try:
            # Create temporary directory for code
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)
                
                # Write Python code to file
                code_file = temp_path / "main.py"
                code_file.write_text(code)
                
                # Create requirements.txt if needed
                if requirements:
                    req_file = temp_path / "requirements.txt"
                    req_file.write_text("\n".join(requirements))
                
                # Create Dockerfile
                dockerfile_content = self._create_dockerfile(bool(requirements))
                dockerfile = temp_path / "Dockerfile"
                dockerfile.write_text(dockerfile_content)
                
                # Build Docker image
                image_tag = f"pylingo-exec-{os.urandom(8).hex()}"
                try:
                    self.client.images.build(
                        path=str(temp_path),
                        tag=image_tag,
                        rm=True,
                        quiet=True
                    )
                except Exception as e:
                    return {
                        "success": False,
                        "output": "",
                        "error": f"Failed to build Docker image: {str(e)}"
                    }
                
                # Run container
                try:
                    container = self.client.containers.run(
                        image_tag,
                        command="python main.py",
                        remove=True,
                        detach=False,
                        stdout=True,
                        stderr=True,
                        timeout=timeout,
                        mem_limit=self._get_memory_limit(requirements),  # Dynamic memory limit
                        network_disabled=self._should_disable_network(requirements)
                    )
                    
                    output = container.decode('utf-8')
                    
                    # Clean up image
                    try:
                        self.client.images.remove(image_tag, force=True)
                    except:
                        pass  # Image cleanup is not critical
                    
                    return {
                        "success": True,
                        "output": output.strip(),
                        "error": ""
                    }
                    
                except docker.errors.ContainerError as e:
                    # Clean up image
                    try:
                        self.client.images.remove(image_tag, force=True)
                    except:
                        pass
                    
                    return {
                        "success": False,
                        "output": "",
                        "error": e.stderr.decode('utf-8') if e.stderr else str(e)
                    }
                
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": f"Execution failed: {str(e)}"
            }
    
    def _get_memory_limit(self, requirements: Optional[list] = None) -> str:
        """Get appropriate memory limit based on requirements"""
        if not requirements:
            return "128m"
        
        # AI/ML packages need more memory
        ml_packages = {'torch', 'torchvision', 'transformers', 'scikit-learn', 'plotly', 'seaborn'}
        if any(pkg in ml_packages for pkg in requirements):
            return "2g"  # 2GB for ML workloads
        
        # Standard packages
        return "512m"
    
    def _should_disable_network(self, requirements: Optional[list] = None) -> bool:
        """Determine if network should be disabled based on requirements"""
        if not requirements:
            return True
        
        # Some packages might need network access during execution
        network_packages = {'plotly', 'requests'}
        return not any(pkg in network_packages for pkg in requirements)
    
    def _create_dockerfile(self, has_requirements: bool) -> str:
        """Create Dockerfile content for code execution"""
        dockerfile = """FROM python:3.11-slim

# Install system dependencies for ML packages
RUN apt-get update && apt-get install -y \\
    gcc \\
    g++ \\
    gfortran \\
    libopenblas-dev \\
    liblapack-dev \\
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install requirements if needed
"""
        
        if has_requirements:
            dockerfile += """# Upgrade pip first
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
"""
        
        dockerfile += """
# Set up non-root user for security
RUN useradd -m -u 1000 runner
USER runner

# Default command
CMD ["python", "main.py"]
"""
        
        return dockerfile
    
    def execute_web_app(
        self, 
        code: str, 
        app_type: str = "flask",
        timeout: int = 60
    ) -> Dict[str, Any]:
        """Execute a web application and return status"""
        
        if not self.available:
            return {
                "success": False,
                "output": "",
                "error": "Docker is not available"
            }
        
        requirements = []
        if app_type == "flask":
            requirements = ["flask"]
        elif app_type == "fastapi":
            requirements = ["fastapi", "uvicorn"]
        
        # For web apps, we'll just test if they can start without errors
        test_code = code + "\n\n# Test if app can be created\nprint('Web app created successfully!')"
        
        return self.execute_python_code(test_code, timeout, requirements)

# Global instance
docker_executor = DockerExecutor()