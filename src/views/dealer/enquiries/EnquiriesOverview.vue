<template>
  <div class="flex w-full flex-col gap-2">
    <div class="flex justify-between gap-3 max-sm:flex-col sm:items-center">
      <div>
        <h2 class="text-xl font-bold">Manage Enquiries</h2>
        <p class="text-muted-foreground max-w-3xl">
          Track and manage customer enquiries. Follow up on leads and convert
          them into sales.
        </p>
      </div>
      <v-btn color="primary" :to="{ name: 'dealer.enquiries.add' }" prepend-icon="mdi-plus">
        Add Enquiry
      </v-btn>
    </div>
    <v-divider class="my-3" />
    <v-card>
      <v-card-text>
        <p class="text-center text-muted-foreground py-8">Enquiries data table will be implemented here</p>
      </v-card-text>
    </v-card>
  </div>
</template>

