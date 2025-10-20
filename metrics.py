from dataclasses import dataclass
from datetime import datetime
import json
import os

@dataclass
class ProcessingMetrics:
    total_processed: int = 0
    successful: int = 0
    failed: int = 0
    low_confidence: int = 0
    start_time: datetime = None
    
    def __post_init__(self):
        if self.start_time is None:
            self.start_time = datetime.now()
    
    def record_success(self):
        self.total_processed += 1
        self.successful += 1
    
    def record_failure(self):
        self.total_processed += 1
        self.failed += 1
    
    def record_low_confidence(self):
        self.low_confidence += 1
    
    def get_stats(self):
        uptime = (datetime.now() - self.start_time).total_seconds() if self.start_time else 0
        return {
            'total': self.total_processed,
            'successful': self.successful,
            'failed': self.failed,
            'low_confidence': self.low_confidence,
            'success_rate': round(self.successful / self.total_processed * 100, 2) if self.total_processed > 0 else 0,
            'uptime_hours': round(uptime / 3600, 2),
            'emails_per_hour': round(self.total_processed / (uptime / 3600), 2) if uptime > 0 else 0
        }
    
    def save(self, filepath='logs/metrics.json'):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w') as f:
            json.dump(self.get_stats(), f, indent=2)
    
    def log_stats(self, logger):
        stats = self.get_stats()
        logger.info(f"📊 Stats: Processed={stats['total']}, Success={stats['successful']}, "
                   f"Failed={stats['failed']}, Success Rate={stats['success_rate']}%, "
                   f"Uptime={stats['uptime_hours']}h, Rate={stats['emails_per_hour']}/h")
