
import Action from 'd2-ui/lib/action/Action';
import { getInstance as getD2 } from 'd2/lib/d2';
import { filterInterpretationsByFavoriteAccess } from '../../utils/permissions';

const actions = Action.createActionsFromNames([
    'listInterpretation',
    'getAllInterpretationsByOrFilters',
    'getInterpretationsByParentFilter',
    'getMap',
    'getEventReport',
    'updateLike',
    'removeLike',
    'deleteInterpretation',
    'editInterpretation'
], 'interpretation');

const parentTypes = [
    "eventReport",
    "eventChart",
    "chart",
    "map",
    "reportTable",
];

// TODO: Does not have fail response, or always response!!!
actions.listInterpretation
.subscribe(({ data: [model, searchData, page], complete, error }) => {
    getD2().then(d2 => {
    let url = 'interpretations?fields=id,type,text,created,lastUpdated,userGroupAccesses[*],access'
        + ',externalAccess,publicAccess,likes,likedBy[id,name],user[id,name,userCredentials[username]]'
        + ',comments[id,created,latestUpdate,text,user[id,name,userCredentials[username]]]'
        + ',eventReport[id,name,relativePeriods,access[read],userAccesses[*],userGroupAccesses[*],externalAccess,publicAccess,user[id,name],favorites,subscribers,mentions]'
        + ',eventChart[id,name,relativePeriods,access[read],userAccesses[*],userGroupAccesses[*],externalAccess,publicAccess,user[id,name],favorites,subscribers,mentions]'
        + ',chart[id,name,relativePeriods,access[read],userAccesses[*],userGroupAccesses[*],externalAccess,publicAccess,user[id,name],favorites,subscribers,mentions]'
        + ',map[id,name,mapViews[relativePeriods],access[read],userAccesses[*],userGroupAccesses[*],externalAccess,publicAccess,user[id,name],favorites,subscribers,mentions]'
        + ',reportTable[id,name,relativePeriods,access[read],userAccesses[*],userGroupAccesses[*],externalAccess,publicAccess,user[id,name],favorites,subscribers,mentions]'
        + searchData;

        if (page !== undefined) {
            url += `&page=${page}&pageSize=10`;
        } else {
            url += '&paging=false';
        }

        d2.Api.getApi().get(url)
        .then(result => {
            const interpretationsWithAccesibleFavorite =
                filterInterpretationsByFavoriteAccess(result.interpretations);
            complete({ ...result, interpretations: interpretationsWithAccesibleFavorite });
        })
        .catch(error);
    });
});

actions.getAllInterpretationsByOrFilters
.subscribe(({ data: [fields, filters], complete }) => {
    getD2().then(d2 => {
        const api = d2.Api.getApi();
        const filterParams = filters.map(filter => `filter=${filter}`);
        const params = [
            "paging=false",
            "fields=" + fields,
            "order=created:desc",
            "rootJunction=OR",
            ...filterParams,
        ];

        api.get(`/interpretations?${params.join("&")}`)
            .then(response => complete(response.interpretations));
    });
});


actions.getInterpretationsByParentFilter
.subscribe(({ data: [fields, parentFilter], complete }) => {
    const filters = parentTypes.map(parentType => `${parentType}.${parentFilter}`);
    actions.getAllInterpretationsByOrFilters("id", filters).subscribe(complete);
});

actions.getMap
.subscribe(({ data: [model, mapId], complete }) => {
    getD2().then(d2 => {
        const url = `/30/maps/${mapId}?fields=id,user,displayName~rename(name),longitude,latitude,zoom,basemap, mapViews[*,columns[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,displayName~rename(name)]],rows[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,displayName~rename(name)]],filters[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,displayName~rename(name)]],dataDimensionItems,program[id,displayName~rename(name)],programStage[id,displayName~rename(name)],legendSet[id,displayName~rename(name)],!lastUpdated,!href,!created,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!organisationUnits,!sortOrder,!topLimit]`;

        d2.Api.getApi().get(url)
        .then(complete)
        .catch(errorResponse => {
            console.log(errorResponse);
        });
    });
});

actions.getEventReport
.subscribe(({ data: [model, reportId], complete }) => {
    getD2().then(d2 => {
        const url = `/eventReports/${reportId}.json?fields=*,program[id,name],programStage[id,name],columns[dimension,filter,legendSet[id,name],items[id,name]],rows[dimension,filter,legendSet[id,name],items[id,name]],filters[dimension,filter,legendSet[id,name],items[id,name]],!lastUpdated,!href,!created,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!organisationUnits`;

        d2.Api.getApi().get(url)
        .then(complete)
        .catch(errorResponse => {
            console.log(errorResponse);
        });
    });
});

actions.deleteInterpretation
    .subscribe(({ data: [model, id], complete }) => {
        const deleteMessage = confirm('Are you sure you want to delete this interpretation?');
        if (deleteMessage) {
            getD2().then(d2 => {
                d2.Api.getApi().delete(`interpretations/${id}`)
                    .then(complete)
                    .catch(complete);
            });
        }
    });

actions.updateLike.subscribe(({ data: [model, id], complete }) => {
    getD2().then(d2 => {
        d2.Api.getApi().post(`interpretations/${id}/like`)
			.then(complete)
			.catch(errorResponse => {
    console.log(errorResponse);
			});
    });
});

actions.removeLike.subscribe(({ data: [model, id], complete }) => {
    getD2().then(d2 => {
        d2.Api.getApi().delete(`interpretations/${id}/like`)
			.then(complete)
			.catch(errorResponse => {
    console.log(errorResponse);
			});
    });
});

actions.editInterpretation
    .subscribe(({ data: [model, id, value], complete }) => {
        getD2().then(d2 => {
            const url = `${d2.Api.getApi().baseUrl}/interpretations/${id}`;

            d2.Api.getApi().request('PUT', url, value, { headers: { "Content-Type": 'text/plain' } })
				.then(complete)
                .catch(errorResponse => {
                    console.log(errorResponse);
                });
        });
    });

export default actions;
