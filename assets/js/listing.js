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
            showMap: true,
            showFilters: true,
            groupMap: {},
            groupMarkers: null
        }
    },
    computed: {
        filteredGroups(){
            let groups = this.groups;
            for (filterName of Object.keys(this.filters)){
                let filter = this.filters[filterName]
                if (!filter.value){
                    if (filterName == "region") { this.filters.place.value = null}
                    continue;
                }

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
        },
        filterCount(){
            let filterCount = 0;
            for (filterName of Object.keys(this.filters)){
                if (this.filters[filterName].value){
                    filterCount += 1;
                }
            }
            return filterCount;
        }
    },
    methods: {
        async loadResource(resource){
            let resourceRes = await fetch('/api/'+resource+'/index.json');
            let resourceJson = await resourceRes.json();
            this[resource] = resourceJson;
            this.updateMapPoints();
            return resourceJson
        },
        createMap(){
            // Create Map
            this.groupMap = L.map("group-map").setView([51.505, -0.09], 5);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(this.groupMap);
            

            // Create marker clusters
            //this.updateMapPoints();
        },
        addMapRegions() {
            // Create regions
            for (region of this.regions){
                L.geoJSON(region.feature, {
                    style:  {
                        "weight": 2,
                        "opacity": 0.65
                    }
                }).addTo(
                    this.groupMap
                ).on(
                    'click', this.regionClicked
                ).airtableID = region.id
            }
            // this.updateMapPoints();
        },
        regionClicked(e) {
            this.filters.region.value = e.target.airtableID;

            this.groupMap.fitBounds((e.target.getBounds()));

            this.updateMapPoints();
        },
        updateMapPoints() {
            if (!this.showMap){ return;}
            if (!this.groupMarkers){
                this.groupMarkers = L.markerClusterGroup({
                    maxClusterRadius: 20,
                  }).addTo(this.groupMap)
            }
            this.groupMarkers.clearLayers()
            
            this.filteredGroups.forEach((group) => {
                if (group.place.length > 0){
                    let placeId = group.place[0];
                    let placeOptions = this.places.filter((place) => place.id == placeId)
                    if (placeOptions.length == 0){ return; }
                    if (!placeOptions[0].center){ return; }

                    let marker = L.marker(placeOptions[0].center).bindPopup(group.name);
                    this.groupMarkers.addLayer(marker)
                }
                
            })
        }
    },
    mounted(){
        this.loadResource('groups');
        this.loadResource('regions').then(() => {
            this.addMapRegions();
        });
        this.loadResource('places');
        this.loadResource('targets');
        this.loadResource('networks');
        this.createMap();
    }
}).mount('#listing-app');