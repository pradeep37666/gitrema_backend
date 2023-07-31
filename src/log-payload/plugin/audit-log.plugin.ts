import { Model, Schema } from 'mongoose';

import { CommonActionType } from '../enum/en';
import { appContext } from 'src/core/Helpers/app-context';

export function auditLogPlugin(schema: Schema<any>, options: any) {
  const getCurrentUserId = (): string => {
    const request = appContext.request;
    const user = request?.user;
    if (user) {
      return user.userId;
    } else {
      return null;
    }
  };
  const getCurrentSupplierId = (): string => {
    const request = appContext.request;
    const user = request?.user;
    if (user) {
      return user.supplierId;
    } else {
      return null;
    }
  };
  schema.post('save', async function (doc, res) {
    const { _id, collection, isNew } = this;
    const AuditLogModel: Model<Document> = this.db.model('AuditLog');
    const auditLog = new AuditLogModel({
      recordId: _id,
      collectionType: this.collection.name,
      url: appContext.request.url,
      query: appContext.request.query,
      body: appContext.request.body,
      //actionType: CommonActionType.CREATE,
      //message: 'Record Created',
      data: this.toObject(),
      addedBy: getCurrentUserId(),
      supplierId: getCurrentSupplierId(),
    });
    await auditLog.save();
  });
  schema.pre(
    /^(update|updateOne|updateMany|findOneAndUpdate)$/,
    { query: true, document: false },
    async function (doc, res) {
      const newValue = this['_update'];
      delete newValue.$set;
      delete newValue.$setOnInsert;
      console.log('Log', newValue, doc);

      const AuditLogModel: Model<Document> =
        this['mongooseCollection']['conn'].model('AuditLog');
      const auditLog = new AuditLogModel({
        recordId: newValue['_id'],
        collectionType: this['_collection']['collectionName'],
        //actionType: CommonActionType.UPDATE,
        url: appContext.request.url,
        query: appContext.request.query,
        body: appContext.request.body,
        //message: 'Record Updated',

        data: newValue,
        addedBy: getCurrentUserId(),
        supplierId: getCurrentSupplierId(),
      });
      await auditLog.save();
      console.log(auditLog);
    },
  );
  // schema.post(
  //   /^(remove|deleteOne|deleteMany|findOneAndDelete|findOneAndRemove)$/,
  //   { query: true, document: true },
  //   async function (doc: Document) {
  //     const AuditLogModel: Model<Document> =
  //       this['mongooseCollection']['conn'].model('AuditLog');
  //     const auditLog = new AuditLogModel({
  //       recordId: doc['_id'],
  //       url: appContext.request.url,
  //       query: appContext.request.query,
  //       body: appContext.request.body,
  //       collectionType: this['_collection']['collectionName'],
  //       //actionType: CommonActionType.DELETE,
  //       message: 'Record Deleted',
  //       oldValue: doc,
  //       addedBy: getCurrentUserId(),
  //       clientId: getCurrentSupplierId(),
  //     });
  //     await auditLog.save();
  //   },
  // );
}
