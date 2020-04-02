<template>
  <div>
    <h1>Some data</h1>
    <input type="text" v-model="search" @change="searchChange"/>
    <div v-if="search.length > 0">
      <p v-for="d in searchChange" :key="d.id">
        {{ d.content }}
      </p>
    </div>
    <div v-else>
      <p>No data match</p>
    </div>
  </div>
</template>

<script>
import SystemInformation from "./LandingPage/SystemInformation";
import api from '../../model'
export default {
  name: "landing-page",
  components: { SystemInformation },

  data: () => ({
    db: "",
    search: "",
    data: '',
    data: []
  }),
  created() {
    this.getAllData();
  },
  computed: {
    searchChange: function() {
      if (this.search === null) {
        return this.data.filter(item => {
          return item.content.toLowerCase();
        });
      } else {
        return this.data.filter(item => {
          return item.content.toLowerCase().includes(this.search.toLowerCase());
        });
      }
    }
  },
  methods: {
    getAllData: function() {
      let query = "select * from enrondata1";
      api.getData(query, (err, rows) => {
        if (err) throw err
        this.data = rows
      });
    }
  }
};
</script>

<style>
</style>
