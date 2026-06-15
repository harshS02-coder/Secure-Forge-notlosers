import type { RiskScore, AIThreat, Permission } from "@contracts/types";

interface ScoringComponents {
  staticScore: number;
  behaviorScore: number;
  aiThreats: AIThreat[];
  permissions: Permission[];
}

export class RiskScorer {
  calculate(components: ScoringComponents): RiskScore {
    const aiScore = this.calculateAIComponent(components.aiThreats);
    
    // Weighted scoring: static 30%, behavior 30%, AI 40%
    const weightedStatic = components.staticScore * 0.3;
    const weightedBehavior = components.behaviorScore * 0.3;
    const weightedAI = aiScore * 0.4;
    
    const totalScore = Math.round(weightedStatic + weightedBehavior + weightedAI);
    const clampedScore = Math.min(100, Math.max(0, totalScore));
    
    const level = this.scoreToLevel(clampedScore);
    
    return {
      score: clampedScore,
      level,
      breakdown: {
        static: Math.round(components.staticScore),
        behavior: Math.round(components.behaviorScore),
        ai: Math.round(aiScore),
      },
    };
  }
  
  private calculateAIComponent(threats: AIThreat[]): number {
    if (threats.length === 0) return 10; // Minimum baseline
    
    const severityWeights: Record<string, number> = {
      critical: 100,
      high: 70,
      medium: 40,
      low: 15,
      info: 5,
    };
    
    let totalWeight = 0;
    for (const threat of threats) {
      totalWeight += severityWeights[threat.severity] || 20;
    }
    
    // Average weighted by threat count, capped at 100
    const avgWeight = totalWeight / threats.length;
    const countMultiplier = Math.min(threats.length / 3, 1.5); // More threats = higher score
    
    return Math.min(100, Math.round(avgWeight * countMultiplier));
  }
  
  private scoreToLevel(score: number): "low" | "medium" | "high" | "critical" {
    if (score <= 25) return "low";
    if (score <= 50) return "medium";
    if (score <= 75) return "high";
    return "critical";
  }
}
