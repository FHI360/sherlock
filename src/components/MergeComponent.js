import { useDataEngine, useDataQuery } from '@dhis2/app-runtime';
import {
	Button,
	ButtonStrip,
	DataTable,
	DataTableBody,
	DataTableCell,
	DataTableColumnHeader,
	DataTableRow,
	Modal,
	ModalActions,
	ModalContent,
	Radio,
	TableHead
} from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import classes from '../App.module.css';


const MergeComponent = ({setMergeAction, selectedMergingItems}) => {
	const engine = useDataEngine()

	const [attributes, setAttributes] = useState([]);
	const [enrollmentAttributes, setEnrollmentAttributes] = useState([]);
	const [events, setEvents] = useState([]);
	const [child, setChild] = useState(null);
	const [parent, setParent] = useState(null);
	const [dataElements, setDataElements] = useState([]);
	const [programStages, setProgramStages] = useState([]);
	const [uids, setUids] = useState('');
	const [stageIds, setStageIds] = useState('');
	const [relationships, setRelationships] = useState([]);
	const [currentItems, setCurrentItems] = useState(0);

	const trackerMutation = {
		resource: 'tracker',
		type: 'create',
		params: {
			async: false
		},
		data: ({payload}) => payload
	}

	const dataElementsQuery = {
		dataElements: {
			resource: 'dataElements',
			params: ({uids}) => ({
				fields: 'name, id',
				filter: `id:in:${uids}`
			})
		},
		programStages: {
			resource: 'programStages',
			params: ({stageIds}) => ({
				fields: 'name, id, programStageDataElements(dataElement,programStage)',
				filter: `id:in:${stageIds}`
			})
		}
	}

	const childTrackedEntity = {
		trackedEntity: {
			resource: `tracker/trackedEntities/${selectedMergingItems.tei_child}`,
			params: ({
				fields: "*"
			}),
		},
	}
	const {
		data: childEntity,
	} = useDataQuery(childTrackedEntity, {variables: {id: selectedMergingItems.tei_child}})

	const parentTrackedEntity = {
		trackedEntity: {
			resource: `tracker/trackedEntities/${selectedMergingItems.tei_parent}`,
			params: ({
				fields: "*"
			}),
		},
	}
	const {
		data: parentEntity,
	} = useDataQuery(parentTrackedEntity, {variables: {id: selectedMergingItems.tei_parent}})

	useEffect(() => {
		if (uids.length && stageIds.length && (uids.length + stageIds.length) !== currentItems) {
			setCurrentItems(uids.length + stageIds.length);
			engine.query(dataElementsQuery, {variables: {uids, stageIds}}).then(queryResult => {
				if (queryResult) {
					setDataElements(queryResult.dataElements.dataElements);
					setProgramStages(queryResult.programStages.programStages)
				}
			})
		}
	}, [uids, dataElements])

	useEffect(() => {
		if (childEntity && parentEntity) {
			setParent(parentEntity.trackedEntity);
			setChild(childEntity.trackedEntity);

			const de = [];
			const stages = [];
			if (parentEntity.trackedEntity.enrollments && parentEntity.trackedEntity.enrollments.length) {
				parentEntity.trackedEntity.enrollments[0].events.forEach(evt => {
					if (!stages.includes(evt.programStage)) {
						stages.push(evt.programStage)
					}
					evt.dataValues.forEach(dv => {
						if (!de.includes(dv.dataElement)) {
							de.push(dv.dataElement);
						}
					})
				})
			}

			if (childEntity.trackedEntity.enrollments && childEntity.trackedEntity.enrollments.length) {
				childEntity.trackedEntity.enrollments[0].events.forEach(evt => {
					if (!stages.includes(evt.programStage)) {
						stages.push(evt.programStage)
					}
					evt.dataValues.forEach(dv => {
						if (!de.includes(dv.dataElement)) {
							de.push(dv.dataElement);
						}
					})
				})
			}

			//Set up default selections
			const events = parentEntity.trackedEntity.enrollments[0].events.map(evt => {
				evt.orgUnit = parentEntity.trackedEntity.orgUnit;
				return evt;
			})
			setEvents(events);
			const attributes = parentEntity.trackedEntity.attributes;
			//Add child attributes not in parent;
			const childAttrs = childEntity.trackedEntity.attributes.filter(attr => {
				return !attributes.find(attribute => attribute.attribute === attr.attribute)
			});
			attributes.push(...childAttrs);
			setAttributes(attributes)

			const enrollmentAttributes = parentEntity.trackedEntity.enrollments[0].attributes;
			//Add child attributes not in parent;
			const childEnrollmentAttrs = childEntity.trackedEntity.enrollments[0].attributes.filter(attr => {
				return !enrollmentAttributes.find(attribute => attribute.attribute === attr.attribute)
			});
			enrollmentAttributes.push(...childEnrollmentAttrs);
			setEnrollmentAttributes(enrollmentAttributes)

			const relationships = parentEntity.trackedEntity.relationships;
			//Add child relationships not in parent;
			const childRelationships = childEntity.trackedEntity.relationships.filter(attr => {
				return !relationships.find(rel => rel.relationship === attr.relationship)
			});
			relationships.push(...childRelationships);
			setRelationships(relationships)

			setUids(`[${de.join(',')}]`)
			setStageIds(`[${stages.join(',')}]`)
		}

	}, [parentEntity, childEntity])

	const sortedEvent = (events) => {
		events = events || []
		events.sort((e1, e2) => e1.programStage.localeCompare(e2.programStage))
		return events;
	}

	const sortedDataValues = (values) => {
		values = values || []
		values.sort((e1, e2) => e1.dataElement.localeCompare(e2.dataElement))
		return values;
	}

	const sortedAttributes = (attributes) => {
		attributes = attributes || []
		attributes.sort((e1, e2) => e1.attribute.localeCompare(e2.attribute))
		return attributes;
	}

	const sortedRelationships = (relationships) => {
		relationships = relationships || []
		relationships.sort((e1, e2) => e1.relationship.localeCompare(e2.relationship))
		return relationships;
	}

	const selectAttribute = (attribute, type) => {
		if (type === 'enrollment') {
			setEnrollmentAttributes(() => {
				const filtered = enrollmentAttributes.filter(attr => attr.attribute !== attribute.attribute)
				filtered.push(attribute);
				return filtered;
			})
		} else {
			setAttributes(() => {
				console.log('Original', attributes)
				const filtered = attributes.filter(attr => attr.attribute !== attribute.attribute)
				filtered.push(attribute);
				console.log('Filtered', filtered)
				return filtered;
			})
		}
	}

	const selectDataValue = (event, dataValue) => {
		setEvents(() => {
			event = {...(events.find(evt => evt.programStage === event.programStage) || event)};
			const filtered = events.filter(evt => evt.programStage !== event.programStage);
			const dataValues = event.dataValues.filter(dv => dv.dataElement !== dataValue.dataElement);
			dataValues.push(dataValue);
			event.dataValues = dataValues;
			if (!event.orgUnit) {
				event.orgUnit = parent.orgUnit
			}
			filtered.push(event);
			return filtered;
		})
	}

	const selectRelationship = (relationship) => {
		setRelationships(() => {
			const filtered = relationships.filter(rel => rel.relationship !== relationship.relationship)
			filtered.push(relationship);
			return filtered;
		})
	}

	const mergeEntities = async () => {
		const entity = parentEntity.trackedEntity;

		//Filter for selected entity attributes
		let filteredAttributes = entity.attributes.filter(attr => !attributes.find(a => a.attribute === attr.attribute));
		filteredAttributes.push(...attributes)
		entity.attributes = filteredAttributes;

		//Filter for selected enrollment attributes
		filteredAttributes = entity.enrollments[0].attributes.filter(attr => !enrollmentAttributes.find(a => a.attribute === attr.attribute));
		filteredAttributes.push(...enrollmentAttributes);
		entity.enrollments[0].attributes = filteredAttributes;

		//Add selected data values
		let filteredEvents = entity.enrollments[0].events.filter(evt => !events.find(e => e.event === evt.event))
		filteredEvents.push(...events);
		//Filter dataElements for stage
		filteredEvents = filteredEvents.map(evt => {
			evt.dataValues = evt.dataValues.filter(dv => {
				const programStageDataElements = programStages.map(ps => {
					return ps.programStageDataElements.filter(psde => {
						return psde.programStage.id === evt.programStage
					}).map(psde => psde.dataElement.id)
				});
				return programStageDataElements.includes(dv.dataElement)
			});
			return evt;
		})
		entity.enrollments[0].events = filteredEvents;

		const enrollments = entity.enrollments;
		delete entity.enrollments;

		//Add selected relationship merging
		const filteredRelationships = entity.relationships.filter(rel => !relationships.find(a => a.relationship === rel.relationship));
		filteredRelationships.push(...relationships)
		entity.relationships = filteredRelationships;

		delete childEntity.trackedEntity.enrollments;
		delete childEntity.trackedEntity.relationships;
		delete childEntity.trackedEntity.programOwners;

		const payload = {
			trackedEntities: [
				entity,
				{
					...childEntity.trackedEntity,
					inactive: true
				}
			],
			enrollments
		};

		// engine.mutate(trackerMutation, {variables: {payload}})
		console.log('payload is  : ',payload)
		const mode = 'update'
		try {
            const response = await engine.mutate({
                  resource: 'tracker',
                  type: mode ? 'create' : 'update',
                  partial: true,
                  // async:false,
                  data : payload
              });
			console.log('trackedEntity update response:', response);

          } catch (error) {
              console.error('trackedEntity error response: ' +  error);
          }
	}

	return (<>
		<Modal large>
			<ModalContent>
				<DataTable className={`${classes.dataTableMargin}`}>
					<TableHead large={true}>
						<DataTableRow>
							<DataTableColumnHeader fixed top="0">
								Parent Entity
							</DataTableColumnHeader>
							<DataTableColumnHeader fixed top="0">
								Child Entity
							</DataTableColumnHeader>
						</DataTableRow>
					</TableHead>
					<DataTableBody>
						<DataTableRow>
							<DataTableCell colSpan={2}>
								Attributes
							</DataTableCell>
						</DataTableRow>
						<DataTableRow>
							<DataTableCell>
								<DataTable>
									<DataTableBody>
										{sortedAttributes(parent?.attributes).map(attr => {
											return (
												<>
													<DataTableRow>
														<DataTableCell>
															{attr ? attr.displayName : ''}
														</DataTableCell>
														<DataTableCell>
															{attr ? attr.value : ''}
														</DataTableCell>
														<DataTableCell>
															<Radio
																checked={attributes.find(a => attr.id === a.id && attr.value === a.value)}
																onChange={() => selectAttribute(attr, 'entity')}/>
														</DataTableCell>
													</DataTableRow>
												</>
											);
										})}
									</DataTableBody>
								</DataTable>
							</DataTableCell>
							<DataTableCell>
								<DataTable>
									<DataTableBody>
										{sortedAttributes(child?.attributes).map(attr => {
											return (
												<>
													<DataTableRow>
														<DataTableCell>
															{attr ? attr.displayName : ''}
														</DataTableCell>
														<DataTableCell>
															{attr ? attr.value : ''}
														</DataTableCell>
														<DataTableCell>
															<Radio
																checked={attributes.find(a => attr.id === a.id && attr.value === a.value)}
																onChange={() => selectAttribute(attr, 'entity')}/>
														</DataTableCell>
													</DataTableRow>
												</>
											);
										})}
									</DataTableBody>
								</DataTable>
							</DataTableCell>
						</DataTableRow>
						<DataTableRow>
							<DataTableCell colSpan={2}>
								Enrollment Attributes
							</DataTableCell>
						</DataTableRow>
						<DataTableRow>
							<DataTableCell>
								<DataTable>
									<DataTableBody>
										{sortedAttributes(parent?.enrollments[0]?.attributes).map(attr => {
											return (
												<>
													<DataTableRow>
														<DataTableCell>
															{attr ? attr.displayName : ''}
														</DataTableCell>
														<DataTableCell>
															{attr ? attr.value : ''}
														</DataTableCell>
														<DataTableCell>
															<Radio
																checked={enrollmentAttributes.find(a => attr.id === a.id && attr.value === a.value)}
																onChange={() => selectAttribute(attr, 'enrollment')}/>
														</DataTableCell>
													</DataTableRow>
												</>
											);
										})}
									</DataTableBody>
								</DataTable>
							</DataTableCell>
							<DataTableCell>
								<DataTable>
									<DataTableBody>
										{sortedAttributes(child?.enrollments[0]?.attributes).map(attr => {
											return (
												<>
													<DataTableRow>
														<DataTableCell>
															{attr ? attr.displayName : ''}
														</DataTableCell>
														<DataTableCell>
															{attr ? attr.value : ''}
														</DataTableCell>
														<DataTableCell>
															<Radio
																checked={enrollmentAttributes.find(a => attr.id === a.id && attr.value === a.value)}
																onChange={() => selectAttribute(attr, 'enrollment')}/>
														</DataTableCell>
													</DataTableRow>
												</>
											);
										})}
									</DataTableBody>
								</DataTable>
							</DataTableCell>
						</DataTableRow>
						<DataTableRow>
							<DataTableCell colSpan={2}>
								Events
							</DataTableCell>
						</DataTableRow>
						<DataTableRow>
							<DataTableCell>
								<DataTable>
									<DataTableBody>
										{sortedEvent(parent?.enrollments[0].events).map(evt => {
											return (
												<>
													<DataTableRow>
														<DataTable>
															<DataTableBody>
																<DataTableRow>
																	<DataTableCell>
																		Program stage
																	</DataTableCell>
																	<DataTableCell>
																		{programStages.find(ps => ps.id === evt.programStage)?.name}
																	</DataTableCell>
																</DataTableRow>
																<DataTableRow>
																	<DataTableCell>
																		Event status
																	</DataTableCell>
																	<DataTableCell>
																		{evt.status}
																	</DataTableCell>
																</DataTableRow>
																<DataTableRow>
																	<DataTableCell colSpan={2}>
																		Data values
																	</DataTableCell>
																</DataTableRow>
																{sortedDataValues(evt.dataValues).map(dv => {
																	return (
																		<>
																			<DataTableRow>
																				<DataTableCell>
																					Data Element
																				</DataTableCell>
																				<DataTableCell colSpan={2}>
																					{dataElements.find(de => de.id === dv.dataElement)?.name}
																				</DataTableCell>
																			</DataTableRow>
																			<DataTableRow>
																				<DataTableCell>
																					Value
																				</DataTableCell>
																				<DataTableCell>
																					{dv.value}
																				</DataTableCell>
																				<DataTableCell>
																					<Radio
																						checked={events.find(a => evt.programStage === a.programStage)?.dataValues.find(v => dv.dataElement === v.dataElement && dv.value === v.value)}
																						onChange={() => selectDataValue(evt, dv)}/>
																				</DataTableCell>
																			</DataTableRow>
																		</>
																	)
																})}
															</DataTableBody>
														</DataTable>
													</DataTableRow>
												</>
											);
										})}
									</DataTableBody>
								</DataTable>
							</DataTableCell>
							<DataTableCell>
								<DataTable>
									<DataTableBody>
										{sortedEvent(child?.enrollments[0].events).map(evt => {
											return (
												<>
													<DataTableRow>
														<DataTable>
															<DataTableBody>
																<DataTableRow>
																	<DataTableCell>
																		Program stage
																	</DataTableCell>
																	<DataTableCell>
																		{programStages.find(ps => ps.id === evt.programStage)?.name}
																	</DataTableCell>
																</DataTableRow>
																<DataTableRow>
																	<DataTableCell>
																		Event status
																	</DataTableCell>
																	<DataTableCell>
																		{evt.status}
																	</DataTableCell>
																</DataTableRow>
																<DataTableRow>
																	<DataTableCell colSpan={2}>
																		Data values
																	</DataTableCell>
																</DataTableRow>
																{sortedDataValues(evt.dataValues).map(dv => {
																	return (
																		<>
																			<DataTableRow>
																				<DataTableCell>
																					Data Element
																				</DataTableCell>
																				<DataTableCell colSpan={2}>
																					{dataElements.find(de => de.id === dv.dataElement)?.name}
																				</DataTableCell>
																			</DataTableRow>
																			<DataTableRow>
																				<DataTableCell>
																					Value
																				</DataTableCell>
																				<DataTableCell>
																					{dv.value}
																				</DataTableCell>
																				<DataTableCell>
																					<Radio
																						checked={events.find(a => evt.programStage === a.programStage)?.dataValues.find(v => dv.dataElement === v.dataElement && dv.value === v.value)}
																						onChange={() => selectDataValue(evt, dv)}/>
																				</DataTableCell>
																			</DataTableRow>
																		</>
																	)
																})}
															</DataTableBody>
														</DataTable>
													</DataTableRow>
												</>
											);
										})}
									</DataTableBody>
								</DataTable>
							</DataTableCell>
						</DataTableRow>
						<DataTableRow>
							<DataTableCell colSpan={2}>
								Relationships
							</DataTableCell>
						</DataTableRow>
						<DataTableRow>
							<DataTableCell>
								<DataTable>
									<DataTableBody>
										{sortedRelationships(parent?.relationships).map(rel => {
											return (
												<>
													<DataTableRow>
														<DataTableCell>
															Name
														</DataTableCell>
														<DataTableCell>
															{rel ? rel.relationshipName : ''}
														</DataTableCell>
														<DataTableCell>
															<Radio
																checked={relationships.find(a => rel.from === a.from && rel.to === a.to && rel.relationshipName === a.relationshipName)}
																onChange={() => selectRelationship(rel)}/>
														</DataTableCell>
													</DataTableRow>
												</>
											);
										})}
									</DataTableBody>
								</DataTable>
							</DataTableCell>
							<DataTableCell>
								<DataTable>
									<DataTableBody>
										{sortedRelationships(child?.relationships).map(rel => {
											return (
												<>
													<DataTableRow>
														<DataTableCell>
															Name
														</DataTableCell>
														<DataTableCell>
															{rel ? rel.relationshipName : ''}
														</DataTableCell>
														<DataTableCell>
															<Radio
																checked={relationships.find(a => rel.from === a.from && rel.to === a.to && rel.relationshipName === a.relationshipName)}
																onChange={() => selectRelationship(rel)}/>
														</DataTableCell>
													</DataTableRow>
												</>
											);
										})}
									</DataTableBody>
								</DataTable>
							</DataTableCell>
						</DataTableRow>
					</DataTableBody>
				</DataTable>
			</ModalContent>
			<ModalActions>
				<ButtonStrip end>
					<Button onClick={() => setMergeAction(false)}>Cancel</Button>
					<Button
						primary
						onClick={mergeEntities}
					>
						Merge
					</Button>
				</ButtonStrip>
			</ModalActions>
		</Modal>
	</>)
}

export default MergeComponent