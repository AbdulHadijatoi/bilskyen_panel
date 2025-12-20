<template>
  <div class="flex w-full flex-col gap-2">
    <div class="flex justify-between gap-3 max-sm:flex-col sm:items-center">
      <div>
        <h2 class="text-xl font-bold">Manage Expenses</h2>
        <p class="text-muted-foreground max-w-3xl">
          Track and manage all business expenses. Monitor your spending and
          maintain financial records.
        </p>
      </div>
      <v-btn color="primary" :to="{ name: 'dealer.expenses.add' }" prepend-icon="mdi-plus">
        Add Expense
      </v-btn>
    </div>
    <v-divider class="my-3" />
    <v-card>
      <v-card-text>
        <p class="text-center text-muted-foreground py-8">Expenses data table will be implemented here</p>
      </v-card-text>
    </v-card>
  </div>
</template>

