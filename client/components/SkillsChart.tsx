"use client"

interface Skill {
  skill: string;
  count: number;
}

interface SkillsChartProps {
  skills: Skill[];
  title?: string;
  maxItems?: number;
}

export default function SkillsChart({ skills, title = "Top Skills", maxItems = 15 }: SkillsChartProps) {
  const displaySkills = skills.slice(0, maxItems);
  const maxCount = displaySkills[0]?.count || 1;

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>

      {displaySkills.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No skills data available</p>
      ) : (
        <div className="space-y-3">
          {displaySkills.map((item, index) => (
            <div key={item.skill} className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-6">{index + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {item.skill}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.count} jobs
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
