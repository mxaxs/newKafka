import { api } from "src/boot/axios";
import { useCoreStore } from "stores/core";
import { useQuery, provideApolloClient } from "@vue/apollo-composable";
import gql from "graphql-tag";
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client/core";
const coreStore = useCoreStore();
const httpLink = createHttpLink({
  uri: "https://nexarxm.top/v1/graphql",
  headers: {
    "x-hasura-admin-secret": "esteehomeusegred0qu3f01descoberto",
  },
});
const cache = new InMemoryCache();
const apolloClient = new ApolloClient({ link: httpLink, cache });
provideApolloClient(apolloClient);
const options = {
  fetchPolicy: "cache-network",
  notifyOnNetworkStatusChange: true,
};

class DataService {
  async allExams(data) {
    try {
      return await api.post("/get-ua-exams", data);
    } catch (error) {
      return printError(error);
    }
  }

  async toAppraise(data) {
    try {
      return await api.post("/to-appraise", data);
    } catch (error) {
      return printError(error);
    }
  }

  async doappraisal(data) {
    try {
      return await api.post("/doappraisal", data);
    } catch (error) {
      return printError(error);
    }
  }

  async bulkPrint(data) {
    try {
      return await api.post("/printbulk", data);
    } catch (error) {
      return printError(error);
    }
  }
  async getTtl(data) {
    try {
      return await api.post("/getttl", data);
    } catch (error) {
      return printError(error);
    }
  }
  async getVidaas(data) {
    try {
      return await api.post("/geturi", data);
    } catch (error) {
      return printError(error);
    }
  }

  async getTokenVidaas(data) {
    try {
      console.log("data", JSON.stringify(data));
      return await api.post("/getvidaastoken", data);
    } catch (error) {
      return printError(error);
    }
  }

  async setPrinted(data) {
    try {
      return await api.post("/setprinted", data);
    } catch (error) {
      return printError(error);
    }
  }

  async requestmedicalreport(data) {
    try {
      return await api.post("/requestmedicalreport", data);
    } catch (error) {
      return printError(error);
    }
  }

  async changemeta(data) {
    try {
      return await api.post("/changemeta", data);
    } catch (error) {
      return printError(error);
    }
  }

  async deletexam(data) {
    try {
      return await api.post("/deletexam", data);
    } catch (error) {
      return printError(error);
    }
  }

  async deletepg(data) {
    try {
      return await api.post("/delete-pg", data);
    } catch (error) {
      return printError(error);
    }
  }

  async removeorfan(data) {
    try {
      return await api.post("/removeorfan", data);
    } catch (error) {
      return printError(error);
    }
  }

  async deletecover(data) {
    try {
      return await api.post("/delete", data);
    } catch (error) {
      return printError(error);
    }
  }

  async get(id) {
    try {
      return await api.get(`/tutorials/${id}`);
    } catch (error) {
      return printError(error);
    }
  }
  async create(data) {
    try {
      return await api.post("/tutorials", data);
    } catch (error) {
      return printError(error);
    }
  }
  async update(id, data) {
    try {
      return await api.put(`/tutorials/${id}`, data);
    } catch (error) {
      return printError(error);
    }
  }

  async appraise(data) {
    try {
      return await api.post("/doappraisal", data);
    } catch (error) {
      return printError(error);
    }
  }

  async changestatus(data) {
    try {
      return await api.post("/changestatus", data);
    } catch (error) {
      return printError(error);
    }
  }

  async reject(data) {
    try {
      this.$apollo.mutate().then((data) => {
        console.warn("Rejected");
      });
      return await api.post("/reject", data);
    } catch (error) {
      return printError(error);
    }
  }

  async heartbeat(data) {
    try {
      return await api.post("/heartbeat", data);
    } catch (error) {
      return printError(error);
    }
  }

  async lockexam(data) {
    try {
      return await api.post("/lockexam", data);
    } catch (error) {
      return printError(error);
    }
  }

  async delete(id) {
    try {
      return await api.delete(`/tutorials/${id}`);
    } catch (error) {
      return printError(error);
    }
  }
  async deleteAll() {
    try {
      return await api.delete(`/tutorials`);
    } catch (error) {
      return printError(error);
    }
  }

  async login(data) {
    try {
      return await api.post("/login", data);
    } catch (error) {
      return printError(error);
    }
  }
}
export default new DataService();




function data(arg0, data) {
  throw new Error("Function not implemented.");
}

function printError(error) {
  if (error.response) {
    // Request made and server responded
    /* console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers); */
    return { status: error.response.status, data: error.response.data };
  } else if (error.request) {
    // The request was made but no response was received
    console.log(error.request);
    return error.request;
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log("Error", error.message);
    return error.message;
  }
}
