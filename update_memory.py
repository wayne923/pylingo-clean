#!/usr/bin/env python3
"""
Generic Memory System for PyLingo Project Context Retention

Updates project memory with new actions and maintains context between sessions.
"""

import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

# Configuration
MAX_ACTIONS = 5  # Keep last 5 actions in rolling window
PROJECT_ROOT = Path(__file__).parent
MEMORY_FILE = PROJECT_ROOT / "project_memory.json"
README_FILE = PROJECT_ROOT / "PROJECT_STATUS.md"

def load_memory() -> Dict[str, Any]:
    """Load existing memory structure"""
    if not MEMORY_FILE.exists():
        initialize_memory()
    
    with open(MEMORY_FILE, 'r') as f:
        return json.load(f)

def save_memory(memory_data: Dict[str, Any]) -> None:
    """Save memory structure to file"""
    with open(MEMORY_FILE, 'w') as f:
        json.dump(memory_data, f, indent=2)

def initialize_memory() -> None:
    """Create initial memory structure"""
    memory_structure = {
        "last_updated": "",
        "project_state": "Initial setup",
        "recent_actions": [],
        "current_priority": "Define project goals",
        "architecture_status": "Setting up infrastructure",
        "deployment_status": {
            "frontend": "not deployed",
            "backend": "not deployed", 
            "database": "not configured"
        },
        "feature_status": {
            "authentication": "pending",
            "skill_tree": "pending",
            "lesson_system": "pending",
            "code_execution": "pending",
            "challenge_system": "pending"
        },
        "technical_debt": [],
        "known_issues": [],
        "learning_tracks": []
    }
    
    save_memory(memory_structure)

def update_memory(action: str, outcome: str, next_reason: str, issues_list: List[str], 
                 priority: str = None, state: str = None) -> None:
    """Add new action and maintain rolling window"""
    
    # Load existing memory
    memory_data = load_memory()
    
    # Create new action entry
    new_action = {
        "timestamp": datetime.now().isoformat(),
        "action": action,
        "outcome": outcome,
        "next_reason": next_reason,
        "issues_to_improve": issues_list
    }
    
    # Rolling window: add to front, keep only last N
    memory_data["recent_actions"].insert(0, new_action)
    memory_data["recent_actions"] = memory_data["recent_actions"][:MAX_ACTIONS]
    
    # Update metadata
    memory_data["last_updated"] = new_action["timestamp"]
    
    # Update priority and state if provided
    if priority:
        memory_data["current_priority"] = priority
    if state:
        memory_data["project_state"] = state
    
    # Save and update documentation
    save_memory(memory_data)
    update_documentation(memory_data)

def format_timestamp(iso_timestamp: str) -> str:
    """Format ISO timestamp for display"""
    if not iso_timestamp:
        return "Not set"
    dt = datetime.fromisoformat(iso_timestamp.replace('Z', '+00:00'))
    return dt.strftime("%Y-%m-%d %H:%M:%S")

def get_latest_action(memory_data: Dict[str, Any]) -> str:
    """Get the most recent action"""
    if not memory_data["recent_actions"]:
        return "No actions recorded"
    return memory_data["recent_actions"][0]["action"]

def get_latest_outcome(memory_data: Dict[str, Any]) -> str:
    """Get the most recent outcome"""
    if not memory_data["recent_actions"]:
        return "No outcomes recorded"
    return memory_data["recent_actions"][0]["outcome"]

def get_latest_next_reason(memory_data: Dict[str, Any]) -> str:
    """Get the most recent next reason"""
    if not memory_data["recent_actions"]:
        return "No next steps defined"
    return memory_data["recent_actions"][0]["next_reason"]

def format_action_section(index: int, action: Dict[str, Any]) -> str:
    """Format a single action for documentation"""
    issues_text = ""
    if action["issues_to_improve"]:
        issues_list = "\n".join([f"  - {issue}" for issue in action["issues_to_improve"]])
        issues_text = f"\n- **Issues Found:**\n{issues_list}"
    
    return f"""
### {index}. {action['action']}
**When:** {format_timestamp(action['timestamp'])}
**Outcome:** {action['outcome']}
**Next Reason:** {action['next_reason']}{issues_text}
"""

def update_documentation(memory_data: Dict[str, Any]) -> None:
    """Generate living documentation from memory"""
    
    doc_content = f"""# PyLingo Project Status

**Last Updated:** {format_timestamp(memory_data['last_updated'])}
**Current State:** {memory_data['project_state']}

## Recent Progress Summary

### Last Action: {get_latest_action(memory_data)}
**Outcome:** {get_latest_outcome(memory_data)}
**Next Reason:** {get_latest_next_reason(memory_data)}

### Current Priority
{memory_data['current_priority']}

## Architecture Status
{memory_data['architecture_status']}

## Deployment Status
- **Frontend:** {memory_data['deployment_status']['frontend']}
- **Backend:** {memory_data['deployment_status']['backend']}  
- **Database:** {memory_data['deployment_status']['database']}

## Feature Status
"""
    
    for feature, status in memory_data['feature_status'].items():
        status_emoji = "✅" if status == "working" else "🔄" if status == "in_progress" else "⏸️"
        doc_content += f"- **{feature.replace('_', ' ').title()}:** {status_emoji} {status}\n"
    
    doc_content += f"""
## Learning Tracks
{', '.join(memory_data['learning_tracks']) if memory_data['learning_tracks'] else 'None configured'}

## Recent Actions History
"""
    
    # Add each recent action with details
    for i, action in enumerate(memory_data["recent_actions"], 1):
        doc_content += format_action_section(i, action)
    
    # Add technical debt section
    if memory_data.get("technical_debt"):
        doc_content += "\n## Technical Debt\n"
        for debt in memory_data["technical_debt"]:
            doc_content += f"- {debt}\n"
    
    # Add known issues section
    if memory_data.get("known_issues"):
        doc_content += "\n## Known Issues\n"
        for issue in memory_data["known_issues"]:
            doc_content += f"- {issue}\n"
    
    doc_content += f"""
## Key Commands
```bash
# Development
cd frontend && npm start              # Start frontend dev server
cd backend && uvicorn main:app --reload  # Start backend dev server

# Deployment
git push origin main                  # Auto-deploy to Netlify/Railway

# Memory Updates
python update_memory.py "action" "outcome" "next_reason" "issue1,issue2"
```

## Context for AI Assistants
This is a Duolingo-style Python learning platform with:
- React/TypeScript frontend deployed on Netlify
- FastAPI backend deployed on Railway  
- PostgreSQL database
- Docker-based code execution
- Multiple learning tracks from beginner to AI/ML
- LeetCode-style coding challenges

**Where we left off:** {get_latest_next_reason(memory_data)}
"""
    
    with open(README_FILE, 'w') as f:
        f.write(doc_content)

def get_context_summary() -> str:
    """Generate context summary for AI handoffs"""
    memory_data = load_memory()
    
    if not memory_data["recent_actions"]:
        return f"""
Project State: {memory_data['project_state']}
Current Priority: {memory_data['current_priority']}
No recent actions recorded.
"""
    
    latest = memory_data["recent_actions"][0]
    return f"""
Project State: {memory_data['project_state']}
Last Action: {latest['action']}
Outcome: {latest['outcome']}  
Next Step Reason: {latest['next_reason']}
Issues to Address: {', '.join(latest['issues_to_improve']) if latest['issues_to_improve'] else 'None'}
Current Priority: {memory_data['current_priority']}
"""

def main():
    """Command-line interface for memory updates"""
    parser = argparse.ArgumentParser(description='Update PyLingo project memory')
    parser.add_argument('action', nargs='?', help='What action was taken')
    parser.add_argument('outcome', nargs='?', help='What was the result')
    parser.add_argument('next_reason', nargs='?', help='Why this leads to next step')
    parser.add_argument('issues', nargs='?', help='Comma-separated list of issues found (use "none" for no issues)')
    parser.add_argument('--priority', help='Update current priority')
    parser.add_argument('--state', help='Update project state') 
    parser.add_argument('--context', action='store_true', help='Show context summary')
    
    args = parser.parse_args()
    
    if args.context:
        print(get_context_summary())
        return
        
    if not all([args.action, args.outcome, args.next_reason, args.issues]):
        parser.error("action, outcome, next_reason, and issues are required unless using --context")
    
    issues_list = [] if args.issues.lower() == "none" else [issue.strip() for issue in args.issues.split(',')]
    
    update_memory(args.action, args.outcome, args.next_reason, issues_list, args.priority, args.state)
    print(f"✅ Memory updated with: {args.action}")
    print(f"📝 Documentation updated at: {README_FILE}")

if __name__ == "__main__":
    main()