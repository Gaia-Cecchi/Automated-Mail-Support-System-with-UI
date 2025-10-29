"""
Statistics Manager for Email Support System
Handles persistent storage of email statistics
"""
import json
import os
import logging
from datetime import datetime
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class StatsManager:
    """Manages email statistics with file persistence"""
    
    def __init__(self, stats_file: str = 'email_stats.json'):
        """
        Initialize the stats manager
        
        Args:
            stats_file: Path to the stats JSON file
        """
        self.stats_file = stats_file
        self._stats = self._load_stats()
        logger.info(f"StatsManager initialized with file: {self.stats_file}")
        logger.info(f"Current stats: {self._stats}")
    
    def _load_stats(self) -> Dict[str, Any]:
        """Load stats from JSON file"""
        if os.path.exists(self.stats_file):
            try:
                with open(self.stats_file, 'r', encoding='utf-8') as f:
                    stats = json.load(f)
                    logger.info(f"Loaded stats from {self.stats_file}")
                    return stats
            except Exception as e:
                logger.error(f"Error loading stats from {self.stats_file}: {e}")
                return self._get_default_stats()
        else:
            logger.info(f"Stats file {self.stats_file} not found, creating new one")
            default_stats = self._get_default_stats()
            self._save_stats(default_stats)
            return default_stats
    
    def _get_default_stats(self) -> Dict[str, Any]:
        """Get default stats structure"""
        return {
            'totalProcessed': 0,
            'totalReceived': 0,
            'byDepartment': {},
            'confidenceByDepartment': {},  # {dept: {total: float, count: int}}
            'lastUpdated': datetime.now().isoformat()
        }
    
    def _save_stats(self, stats: Optional[Dict[str, Any]] = None) -> None:
        """Save stats to JSON file"""
        try:
            stats_to_save = stats if stats is not None else self._stats
            with open(self.stats_file, 'w', encoding='utf-8') as f:
                json.dump(stats_to_save, f, indent=2, ensure_ascii=False)
            logger.info(f"Stats saved to {self.stats_file}")
        except Exception as e:
            logger.error(f"Error saving stats to {self.stats_file}: {e}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get current statistics"""
        return self._stats.copy()
    
    def update_received_count(self, count: int) -> Dict[str, Any]:
        """
        Update total received emails count
        
        Args:
            count: Number of emails to add to received count
            
        Returns:
            Updated stats
        """
        self._stats['totalReceived'] = self._stats.get('totalReceived', 0) + count
        self._stats['lastUpdated'] = datetime.now().isoformat()
        self._save_stats()
        logger.info(f"Updated received count: +{count} (total: {self._stats['totalReceived']})")
        return self.get_stats()
    
    def update_processed_email(self, department: str, confidence: float = 0.0) -> Dict[str, Any]:
        """
        Update stats when an email is processed/forwarded
        
        Args:
            department: Department name the email was forwarded to
            confidence: AI confidence score (0-100)
            
        Returns:
            Updated stats
        """
        # Increment total processed
        self._stats['totalProcessed'] = self._stats.get('totalProcessed', 0) + 1
        
        # Increment department count
        if 'byDepartment' not in self._stats:
            self._stats['byDepartment'] = {}
        
        self._stats['byDepartment'][department] = self._stats['byDepartment'].get(department, 0) + 1
        
        # Update confidence for department
        if 'confidenceByDepartment' not in self._stats:
            self._stats['confidenceByDepartment'] = {}
        
        if department not in self._stats['confidenceByDepartment']:
            self._stats['confidenceByDepartment'][department] = {'total': 0.0, 'count': 0}
        
        self._stats['confidenceByDepartment'][department]['total'] += confidence
        self._stats['confidenceByDepartment'][department]['count'] += 1
        
        self._stats['lastUpdated'] = datetime.now().isoformat()
        self._save_stats()
        
        logger.info(f"Updated processed stats: {department} (confidence: {confidence}, total: {self._stats['totalProcessed']})")
        return self.get_stats()
    
    def reset_stats(self) -> Dict[str, Any]:
        """Reset all statistics"""
        self._stats = self._get_default_stats()
        self._save_stats()
        logger.info("Stats reset to default")
        return self.get_stats()
    
    def set_stats(self, stats: Dict[str, Any]) -> Dict[str, Any]:
        """
        Set complete stats (used for migration or manual updates)
        
        Args:
            stats: Complete stats dictionary
            
        Returns:
            Updated stats
        """
        self._stats = stats
        self._stats['lastUpdated'] = datetime.now().isoformat()
        self._save_stats()
        logger.info("Stats manually updated")
        return self.get_stats()
