import { FiButton } from "@/app/components/button/FiButton";
import { useRecipientsList } from "@/app/recipients/hooks/useRecipientsList";
import { getFiRecipientsClassName } from "@/app/components/recipients/recipientsVariants";
import { FiRecipientsArchivedSection, FiRecipientsEmptyState, FiRecipientsNoResults } from "@/app/components/recipients/FiRecipientsStates";
import { FiRecipientsComingUp, FiRecipientsGroupSection } from "@/app/components/recipients/FiRecipientsSections";
import { FiRecipientsErrorState } from "@/app/components/recipients/FiRecipientsLoadingError";
import { FiRecipientsHeader } from "@/app/components/recipients/FiRecipientsHeader";
import { FiRecipientsToolbar } from "@/app/components/recipients/FiRecipientsToolbar";
import { recipientsListDefaults } from "@/app/recipients/recipientsListDomain";

export function FiRecipientsPage() {
  const list = useRecipientsList();

  if (list.error) {
    return (
      <div className={getFiRecipientsClassName()}>
        <FiRecipientsHeader />
        <FiRecipientsErrorState onRetry={list.retry} />
      </div>
    );
  }

  if (list.isEmpty) {
    return (
      <div className={getFiRecipientsClassName()}>
        <FiRecipientsHeader />
        <FiRecipientsEmptyState />
      </div>
    );
  }

  return (
    <div className={getFiRecipientsClassName()}>
      <FiRecipientsHeader />

      <FiRecipientsToolbar
        search={list.search}
        filterId={list.filterId}
        sortId={list.sortId}
        showSearch={list.recipients.length > 0}
        onSearchChange={list.setSearch}
        onFilterChange={list.setFilterId}
        onSortChange={list.setSortId}
      />

      {list.hasNoResults ? <FiRecipientsNoResults query={list.search} /> : null}

      {!list.hasNoResults && list.comingUpSoon.length > 0 ? (
        <FiRecipientsComingUp items={list.comingUpSoon} />
      ) : null}

      {!list.hasNoResults ? (
        <>
          <FiRecipientsGroupSection
            title="Family"
            recipients={list.groups.family}
            healthById={list.healthById}
          />
          <FiRecipientsGroupSection
            title="Friends"
            recipients={list.groups.friends}
            healthById={list.healthById}
          />
          <FiRecipientsGroupSection
            title="Others"
            recipients={list.groups.other}
            healthById={list.healthById}
          />

          {list.hasMore ? (
            <FiButton variant="secondary" onClick={list.loadMore}>
              {recipientsListDefaults.loadMoreLabel}
            </FiButton>
          ) : null}
        </>
      ) : null}

      <FiRecipientsArchivedSection
        archived={list.archived}
        showArchived={list.showArchived}
        restoringId={list.restoringId}
        onToggle={() => list.setShowArchived((value) => !value)}
        onRestore={list.restoreArchived}
      />
    </div>
  );
}
