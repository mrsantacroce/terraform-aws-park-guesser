variable "log_group_name" {
  description = "Name of the CloudWatch Log Group"
  type        = string
}

variable "retention_days" {
  description = "Number of days to retain logs"
  type        = number
  default     = 7
}

variable "alarm_name" {
  description = "Name of the CloudWatch alarm"
  type        = string
}

variable "metric_name" {
  description = "Name of the CloudWatch metric"
  type        = string
  default     = "HintUsageCount"
}

variable "metric_namespace" {
  description = "Namespace for the CloudWatch metric"
  type        = string
  default     = "ParkGuesser"
}

variable "threshold" {
  description = "Threshold for the alarm (number of hints used)"
  type        = number
  default     = 1
}

variable "period" {
  description = "Period in seconds for the metric evaluation"
  type        = number
  default     = 300 # 5 minutes
}

variable "evaluation_periods" {
  description = "Number of periods over which to evaluate the alarm"
  type        = number
  default     = 1
}

variable "alarm_actions" {
  description = "List of ARNs to notify when alarm triggers (e.g., SNS topic ARNs)"
  type        = list(string)
  default     = []
}

variable "environment" {
  description = "Environment name for tagging"
  type        = string
}
