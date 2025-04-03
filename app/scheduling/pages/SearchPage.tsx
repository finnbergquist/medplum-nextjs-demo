import { Paper } from '@mantine/core';
import { Filter, formatSearchQuery, parseSearchRequest, SearchRequest, SortRule } from '@medplum/core';
import { UserConfiguration } from '@medplum/fhirtypes';
import { Loading, SearchControl, useMedplum } from '@medplum/react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import classes from './SearchPage.module.css';

export function SearchPage(): JSX.Element {
  const medplum = useMedplum();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState<SearchRequest>();

  useEffect(() => {
    const searchString = searchParams.toString();
    const parsedSearch = parseSearchRequest(pathname + (searchString ? `?${searchString}` : ''));

    if (!parsedSearch.resourceType) {
      // If there is no search, go to the Patient search page by default
      router.push('/patient');
      return;
    }

    // Populate the search with default values as necessary
    const populatedSearch = addSearchValues(parsedSearch, medplum.getUserConfiguration());

    if (
      // If the current url matches the search, set the search, otherwise navigate to the correct url
      pathname === `/${populatedSearch.resourceType.toLowerCase()}` &&
      searchString === formatSearchQuery(populatedSearch)
    ) {
      saveLastSearch(populatedSearch);
      setSearch(populatedSearch);
    } else {
      router.push(`/${populatedSearch.resourceType.toLowerCase()}${formatSearchQuery(populatedSearch)}`);
    }
  }, [medplum, router, pathname, searchParams]);

  if (!search?.resourceType || !search.fields || search.fields.length === 0) {
    return <Loading />;
  }

  return (
    <Paper shadow="xs" m="md" p="xs" className={classes.paper}>
      <SearchControl
        checkboxesEnabled={false}
        search={search}
        onClick={(e) => router.push(`/${e.resource.resourceType.toLowerCase()}/${e.resource.id}`)}
        onAuxClick={(e) => window.open(`/${e.resource.resourceType.toLowerCase()}/${e.resource.id}`, '_blank')}
        onChange={(e) => {
          router.push(`/${search.resourceType.toLowerCase()}${formatSearchQuery(e.definition)}`);
        }}
        hideFilters={true}
        hideToolbar
      />
    </Paper>
  );
}

function addSearchValues(search: SearchRequest, config: UserConfiguration | undefined): SearchRequest {
  const resourceType = search.resourceType || getDefaultResourceType(config);
  const fields = search.fields ?? getDefaultFields(search.resourceType);
  const filters = search.filters ?? (!search.resourceType ? getDefaultFilters(resourceType) : undefined);
  const sortRules = search.sortRules ?? getDefaultSortRules(resourceType);

  return {
    ...search,
    resourceType,
    fields,
    filters,
    sortRules,
  };
}

function getDefaultResourceType(config: UserConfiguration | undefined): string {
  return (
    localStorage.getItem('defaultResourceType') ??
    config?.option?.find((o) => o.id === 'defaultResourceType')?.valueString ??
    'Task'
  );
}

function getDefaultFilters(resourceType: string): Filter[] | undefined {
  return getLastSearch(resourceType)?.filters;
}

function getDefaultSortRules(resourceType: string): SortRule[] {
  const lastSearch = getLastSearch(resourceType);
  if (lastSearch?.sortRules) {
    return lastSearch.sortRules;
  }
  return [{ code: '_lastUpdated', descending: true }];
}

function getLastSearch(resourceType: string): SearchRequest | undefined {
  const value = localStorage.getItem(resourceType + '-defaultSearch');
  return value ? (JSON.parse(value) as SearchRequest) : undefined;
}

function saveLastSearch(search: SearchRequest): void {
  localStorage.setItem('defaultResourceType', search.resourceType);
  localStorage.setItem(search.resourceType + '-defaultSearch', JSON.stringify(search));
}

function getDefaultFields(resourceType: string): string[] {
  switch (resourceType) {
    case 'Patient':
      return ['name', 'gender', 'birthDate', '_lastUpdated'];
    default:
      return ['_id', '_lastUpdated'];
  }
}
