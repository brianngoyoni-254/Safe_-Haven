from dataclasses import dataclass
from typing import List, Optional


@dataclass
class CheckInSchema:
    id: str
    user_id: str
    date: Optional[str]
    mood: int
    craving_level: int
    sober_today: bool
    notes: Optional[str]
    created_at: Optional[str]
    updated_at: Optional[str]


@dataclass
class MilestoneSchema:
    id: str
    user_id: str
    days: int
    achieved_at: Optional[str]
    created_at: Optional[str]


@dataclass
class UpcomingSessionSchema:
    groupId: str
    groupName: str
    time: str
    meetsToday: bool


@dataclass
class DashboardSummarySchema:
    checkIns: List[CheckInSchema]
    todayCheckIn: Optional[CheckInSchema]
    earnedMilestones: List[MilestoneSchema]
    upcomingSession: Optional[UpcomingSessionSchema]
