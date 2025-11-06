# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "this" {
  name              = var.log_group_name
  retention_in_days = var.retention_days

  tags = {
    Name        = var.log_group_name
    Environment = var.environment
  }
}

# CloudWatch Log Metric Filter - Counts HINT_USED events
resource "aws_cloudwatch_log_metric_filter" "hint_usage" {
  name           = "${var.alarm_name}-metric-filter"
  log_group_name = aws_cloudwatch_log_group.this.name
  pattern        = "{ $.event = \"HINT_USED\" }"

  metric_transformation {
    name      = var.metric_name
    namespace = var.metric_namespace
    value     = "1"
    unit      = "Count"
  }
}

# CloudWatch Alarm - Triggers when hints are used
resource "aws_cloudwatch_metric_alarm" "hint_usage" {
  alarm_name          = var.alarm_name
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = var.evaluation_periods
  metric_name         = var.metric_name
  namespace           = var.metric_namespace
  period              = var.period
  statistic           = "Sum"
  threshold           = var.threshold
  treat_missing_data  = "notBreaching"

  alarm_description = "This metric monitors hint usage in the Park Guesser app"
  alarm_actions     = var.alarm_actions

  tags = {
    Name        = var.alarm_name
    Environment = var.environment
  }
}
