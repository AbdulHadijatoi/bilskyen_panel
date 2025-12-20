<template>
  <div class="flex w-full flex-col gap-2">
    <div class="flex justify-between gap-3 max-sm:flex-col sm:items-center">
      <div>
        <h2 class="text-xl font-bold">Manage Sales</h2>
        <p class="text-muted-foreground max-w-3xl">
          View and manage all vehicle sales. Track sales history and revenue.
        </p>
      </div>
      <v-btn color="primary" :to="{ name: 'dealer.sales.add' }" prepend-icon="mdi-plus">
        Add Sale
      </v-btn>
    </div>
    <v-divider class="my-3" />
    <v-card>
      <v-card-text>
        <p class="text-center text-muted-foreground py-8">Sales data table will be implemented here</p>
      </v-card-text>
    </v-card>
  </div>
</template>

