---
name: troubleshoot.k8s_pods
description: Checks Kubernetes pods for errors, crashes, or misconfigurations and suggests fixes.
purpose: Identify failing pods and provide recommended commands or configuration fixes.
subagents:
  - error_fixing_agent
Input Example:

{
  "namespace": "default"
}
Output Example:

{
  "success": true,
  "issues_found": [
    {
      "pod_name": "backend-xyz",
      "error": "CrashLoopBackOff",
      "suggested_fix": "Check logs: kubectl logs backend-xyz; Verify environment variables"
    }
  ]
}
