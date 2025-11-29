import { ComplianceResult } from '@/lib/types/campaign';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ComplianceResultsProps {
  results: ComplianceResult[];
  maxDisplay?: number;
}

export default function ComplianceResults({ results, maxDisplay = 50 }: ComplianceResultsProps) {
  const displayResults = results.slice(0, maxDisplay);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-navy-primary mb-4 flex items-center">
        <span>Compliance Results</span>
        <span className="ml-2 text-sm text-gray-500">
          (Showing {displayResults.length} of {results.length})
        </span>
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="text-left p-3 font-semibold text-navy-primary">Customer ID</th>
              <th className="text-left p-3 font-semibold text-navy-primary">Variant ID</th>
              <th className="text-center p-3 font-semibold text-navy-primary">Status</th>
              <th className="text-center p-3 font-semibold text-navy-primary">Safety Scores</th>
              <th className="text-left p-3 font-semibold text-navy-primary">Reason</th>
            </tr>
          </thead>
          <tbody>
            {displayResults.map((result, index) => (
              <tr
                key={`${result.customer_id}-${result.variant_id}`}
                className={`border-b hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="p-3 font-mono text-xs">{result.customer_id}</td>
                <td className="p-3 font-mono text-xs">{result.variant_id}</td>
                <td className="p-3 text-center">
                  {result.status === 'APPROVED' ? (
                    <Badge variant="default" className="inline-flex items-center bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="inline-flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Rejected
                    </Badge>
                  )}
                </td>
                <td className="p-3">
                  {result.safety_scores ? (
                    <div className="flex justify-center space-x-2 text-xs">
                      <span className={result.safety_scores.hate > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                        H:{result.safety_scores.hate}
                      </span>
                      <span className={result.safety_scores.violence > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                        V:{result.safety_scores.violence}
                      </span>
                      <span className={result.safety_scores.sexual > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                        S:{result.safety_scores.sexual}
                      </span>
                      <span className={result.safety_scores.self_harm > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                        SH:{result.safety_scores.self_harm}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-gray-400 italic">
                      N/A
                    </div>
                  )}
                </td>
                <td className="p-3 text-xs text-gray-700">{result.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {results.length > maxDisplay && (
        <div className="mt-4 text-center">
          <button className="text-cyan-primary hover:text-cyan-secondary font-medium">
            Load More Results ({results.length - maxDisplay} remaining)
          </button>
        </div>
      )}
    </div>
  );
}