const { createApp } = Vue;

let listingApp = createApp({
    data() {
        return {
            groups: [],
            regions: [],
            places: [],
            targets: [],
            networks: [],
            filters: {
                "region": {
                    "value": null,
                    "display": true
                },
                "place": {
                    "value": null,
                    "display": true
                },
                "network": {
                    "value": null,
                    "display": true
                },
                "target": {
                    "value": null,
                    "display": true
                }
            },
            showMap: false,
            showFilters: true
        }
    },
    computed: {
        filteredGroups(){
            let groups = this.groups;
            for (filterName of Object.keys(this.filters)){
                let filter = this.filters[filterName]
                console.log(filter)
                if (!filter.value){ continue; }

                console.log("filtering on "+ filterName)

                groups = groups.filter(function(group){
                    if (Array.isArray(group[filterName])){
                        return group[filterName].includes(filter.value);
                    }else{
                        return group[filterName] == filter.value;
                    }
                    
                })
            }

            return groups;
        },
        filteredPlaces(){
            let places = this.places
            if (!this.filters.region.value){
                return places;
            }
            return places.filter((place) => {
                return place.region == this.filters.region.value
            })
        }
    },
    methods: {
        async loadResource(resource){
            let resourceRes = await fetch('/api/'+resource+'/index.json');
            let resourceJson = await resourceRes.json();
            this[resource] = resourceJson;
            return resourceJson
        }
    },
    mounted(){
        this.loadResource('groups');
        this.loadResource('regions');
        this.loadResource('places');
        this.loadResource('targets');
        this.loadResource('networks');
    }
}).mount('#listing-app');