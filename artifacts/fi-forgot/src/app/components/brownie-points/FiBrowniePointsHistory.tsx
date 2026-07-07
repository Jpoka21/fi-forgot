import {
  brownieActionEmojis,
  browniePointsDefaults,
  formatBrownieTransactionDate,
  type FiBrowniePointTransaction,
} from "@/app/brownie-points/browniePointsDomain";
import { getFiBrowniePointsHistoryItemClassName } from "@/app/components/brownie-points/browniePointsVariants";

export interface FiBrowniePointsHistoryProps {
  transactions: FiBrowniePointTransaction[];
  showEmpty?: boolean;
}

export function FiBrowniePointsHistory({
  transactions,
  showEmpty = false,
}: FiBrowniePointsHistoryProps) {
  return (
    <section className="fi-brownie-points__history" aria-labelledby="fi-brownie-points-history">
      <h3 id="fi-brownie-points-history" className="fi-brownie-points__section-title">
        {browniePointsDefaults.historyTitle}
      </h3>

      {showEmpty ? (
        <div className="fi-brownie-points__history-empty" role="status">
          <p className="fi-brownie-points__section-title">{browniePointsDefaults.historyEmptyTitle}</p>
          <p>{browniePointsDefaults.historyEmptyDescription}</p>
        </div>
      ) : (
        <ul className="fi-brownie-points__history-list" aria-label="Brownie Points activity">
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              <article className={getFiBrowniePointsHistoryItemClassName()}>
                <span className="fi-brownie-points__history-emoji" aria-hidden>
                  {brownieActionEmojis[transaction.actionType] ?? "🍪"}
                </span>
                <div className="fi-brownie-points__history-body">
                  <p className="fi-brownie-points__history-title">{transaction.description}</p>
                  <p className="fi-brownie-points__history-date">
                    {formatBrownieTransactionDate(transaction.createdAt)}
                  </p>
                </div>
                <p className="fi-brownie-points__history-points">+{transaction.points}</p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
